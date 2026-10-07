// Route readiness checks run before any signature. Each failing or unknown
// check carries a specific remediation; nothing that can't be confirmed counts
// as passing.

import { EVM_NETWORKS, STELLAR_NETWORKS } from "./networks.ts"
import { actionAvailability, loanToken } from "./model.ts"
import type { LendingAction, Market, RouteAvailability } from "./model"
import type { NetworkEnv } from "./networks"

export type CheckStatus = "pass" | "fail" | "unknown" | "not-needed"

export type PreflightCheck = {
  id: string
  label: string
  status: CheckStatus
  detail?: string
  remediation?: string
}

export type PreflightInput = {
  routeEnv: NetworkEnv
  market: Market
  route: RouteAvailability | undefined
  action: LendingAction
  // Amount in the market's loan-token units; null while the user is typing.
  amount: bigint | null
  stellar: {
    address: string | null
    // Passphrase reported by the wallet itself, when it says.
    walletPassphrase: string | null
    // USDC balance in Stellar's 7-decimal units.
    usdcBalance: bigint | null
    hasUsdcTrustline: boolean | null
  }
  evm: {
    address: string | null
    chainId: number | null
    nativeBalance: bigint | null
  }
  executionAccount: { deployed: boolean | null }
  gasSponsorship: { available: boolean | null }
}

// Where funds come from and go to for each action.
export function actionLegs(action: LendingAction): { funding: "stellar" | "evm"; payout: "stellar" | null } {
  switch (action) {
    case "lend":
    case "repay":
      return { funding: "stellar", payout: null }
    case "borrow":
    case "withdraw":
      return { funding: "evm", payout: "stellar" }
    case "post-collateral":
    case "withdraw-collateral":
      return { funding: "evm", payout: null }
  }
}

const pass = (id: string, label: string, detail?: string): PreflightCheck => ({ id, label, status: "pass", detail })
const skip = (id: string, label: string): PreflightCheck => ({ id, label, status: "not-needed" })

export function runPreflight(input: PreflightInput): Array<PreflightCheck> {
  const { market, routeEnv, action, amount } = input
  const chain = market.ref.chain
  const evmNetwork = EVM_NETWORKS[routeEnv][chain]
  const stellarNetwork = STELLAR_NETWORKS[routeEnv]
  const token = loanToken(market)
  const legs = actionLegs(action)
  const checks: Array<PreflightCheck> = []

  // 1. Environment and canonical asset.
  if (market.env !== routeEnv) {
    checks.push({
      id: "environment",
      label: "Network environment",
      status: "fail",
      detail:
        market.env === "fixture"
          ? "This market is preview data, not a deployed market."
          : `This is a ${market.env} market, but the app is configured for ${routeEnv}.`,
      remediation: "Choose a market listed for this network.",
    })
  } else checks.push(pass("environment", "Network environment", routeEnv))

  const lookalike = evmNetwork.lookalikes.find((l) => l.address.toLowerCase() === token.address.toLowerCase())
  if (lookalike) {
    checks.push({
      id: "asset",
      label: "Native USDC",
      status: "fail",
      detail: `${lookalike.symbol} is bridged USDC, not Circle's native USDC. CCTP cannot carry it.`,
      remediation: "Use a market whose loan asset is native USDC.",
    })
  } else if (token.symbol === "USDC" && token.address.toLowerCase() !== evmNetwork.usdc.toLowerCase()) {
    checks.push({
      id: "asset",
      label: "Native USDC",
      status: "fail",
      detail: `The market's USDC (${token.address}) is not ${evmNetwork.name}'s native USDC.`,
      remediation: "Use a market whose loan asset is native USDC.",
    })
  } else checks.push(pass("asset", "Native USDC"))

  // 2. Route and protocol state.
  const availability = actionAvailability(market, input.route).find((a) => a.action === action)
  if (!availability) {
    checks.push({ id: "action", label: "Action supported", status: "fail", detail: "This market doesn't offer that action." })
  } else if (!availability.available) {
    checks.push({
      id: "action",
      label: "Route and market open",
      status: "fail",
      detail: availability.reasons.join(" "),
      remediation: "Wait for the route to open or choose another market.",
    })
  } else checks.push(pass("action", "Route and market open"))

  // 3. Stellar side.
  const stellarNeeded = legs.funding === "stellar" || legs.payout === "stellar"
  if (!stellarNeeded) {
    checks.push(skip("stellar-wallet", "Stellar wallet"))
  } else if (!input.stellar.address) {
    checks.push({
      id: "stellar-wallet",
      label: "Stellar wallet",
      status: "fail",
      remediation: legs.funding === "stellar" ? "Connect the Stellar wallet that holds your USDC." : "Connect the Stellar wallet that should receive USDC.",
    })
  } else if (input.stellar.walletPassphrase && input.stellar.walletPassphrase !== stellarNetwork.passphrase) {
    checks.push({
      id: "stellar-wallet",
      label: "Stellar wallet",
      status: "fail",
      detail: "Your Stellar wallet is on a different network.",
      remediation: `Switch your Stellar wallet to ${stellarNetwork.label}.`,
    })
  } else checks.push(pass("stellar-wallet", "Stellar wallet", stellarNetwork.label))

  if (!stellarNeeded) checks.push(skip("trustline", "USDC trustline"))
  else if (input.stellar.hasUsdcTrustline === null)
    checks.push({ id: "trustline", label: "USDC trustline", status: "unknown", remediation: "Reconnect your Stellar wallet so the account can be read." })
  else if (!input.stellar.hasUsdcTrustline)
    checks.push({
      id: "trustline",
      label: "USDC trustline",
      status: "fail",
      detail: "Your Stellar account can't hold Circle USDC yet.",
      remediation: "Add a USDC trustline in your Stellar wallet (issuer " + stellarNetwork.usdc.issuer.slice(0, 6) + "…).",
    })
  else checks.push(pass("trustline", "USDC trustline"))

  if (legs.funding !== "stellar") checks.push(skip("stellar-balance", "Stellar USDC balance"))
  else if (amount === null) checks.push({ id: "stellar-balance", label: "Stellar USDC balance", status: "unknown", detail: "Enter an amount." })
  else if (input.stellar.usdcBalance === null)
    checks.push({ id: "stellar-balance", label: "Stellar USDC balance", status: "unknown", remediation: "Couldn't read your balance. Try again." })
  else {
    // Stellar USDC has 7 decimals; the EVM loan token has 6.
    const needed = amount * 10n ** BigInt(7 - token.decimals)
    checks.push(
      input.stellar.usdcBalance >= needed
        ? pass("stellar-balance", "Stellar USDC balance")
        : { id: "stellar-balance", label: "Stellar USDC balance", status: "fail", remediation: "Lower the amount or add USDC to your Stellar wallet." }
    )
  }

  // 4. EVM side. Every action ends with an EVM signature for the destination.
  if (!input.evm.address)
    checks.push({ id: "evm-wallet", label: "EVM wallet", status: "fail", remediation: "Connect the EVM wallet that will own your position." })
  else if (input.evm.chainId !== evmNetwork.chainId)
    checks.push({
      id: "evm-wallet",
      label: "EVM wallet network",
      status: "fail",
      detail: "Your EVM wallet is on a different chain.",
      remediation: `Switch your EVM wallet to ${evmNetwork.name}.`,
    })
  else checks.push(pass("evm-wallet", "EVM wallet", evmNetwork.name))

  if (input.executionAccount.deployed === null)
    checks.push({
      id: "account",
      label: "Execution account",
      status: "unknown",
      detail: "Account discovery isn't available yet.",
      remediation: "This check opens when execution accounts are deployed.",
    })
  else if (!input.executionAccount.deployed)
    checks.push({
      id: "account",
      label: "Execution account",
      status: "fail",
      remediation: `Create your execution account on ${evmNetwork.name} first. It takes one EVM signature.`,
    })
  else checks.push(pass("account", "Execution account"))

  if (input.gasSponsorship.available === true) checks.push(pass("gas", "Destination gas", "Sponsored for this route"))
  else if (input.evm.nativeBalance === null)
    checks.push({
      id: "gas",
      label: "Destination gas",
      status: "unknown",
      detail: input.gasSponsorship.available === null ? "Gas sponsorship availability is unknown." : undefined,
      remediation: `Couldn't read your ${evmNetwork.name} ETH balance.`,
    })
  else if (input.evm.nativeBalance === 0n)
    checks.push({
      id: "gas",
      label: "Destination gas",
      status: "fail",
      detail: "Gas isn't sponsored for this route and your EVM wallet has no ETH.",
      remediation: `Add a little ETH on ${evmNetwork.name} for network fees.`,
    })
  else checks.push(pass("gas", "Destination gas", "Paid from your EVM wallet"))

  return checks
}

export function isReady(checks: Array<PreflightCheck>) {
  return checks.every((c) => c.status === "pass" || c.status === "not-needed")
}
