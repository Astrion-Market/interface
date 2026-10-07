// Quotes for the transaction composer. Building one needs no wallet and no
// spending authority. A quote is bound to the exact request it was built for:
// any change to amount, recipient, market, or action invalidates it.

import { actionLegs } from "./preflight.ts"
import type { ChainId } from "../lending/lib/identity"
import type { LendingAction, Market } from "./model"
import type { FeeSchedule } from "./positions"

export type QuoteRequest = {
  env: string
  marketKey: string
  action: LendingAction
  amount: bigint
  // Stellar recipient for payouts; null when nothing returns to Stellar.
  recipient: string | null
  owner: { stellar: string | null; evm: string | null }
  // Borrow collateral, when posting any.
  collateral: { token: string; amount: bigint } | null
}

export type FeeLine = {
  label: string
  amount: bigint
  symbol: string
  decimals: number
  payer: "you" | "sponsor"
}

export type SignatureStep = {
  wallet: "stellar" | "evm"
  chain: ChainId
  label: string
}

export type Quote = {
  fingerprint: string
  createdAt: number
  expiresAt: number
  fees: Array<FeeLine>
  // Least the user ends up with after USDC-denominated fees, in loan units.
  minimumResult: bigint
  signatures: Array<SignatureStep>
}

export type QuoteIssue = { kind: "changed" | "expired" | "fee-too-high" | "invalid"; message: string }

export const QUOTE_TTL_MS = 60_000
// Block when USDC fees exceed this share of the amount.
export const MAX_FEE_BPS = 100n

export function quoteFingerprint(req: QuoteRequest): string {
  return [
    req.env,
    req.marketKey,
    req.action,
    req.amount.toString(),
    req.recipient ?? "-",
    req.owner.stellar ?? "-",
    req.owner.evm?.toLowerCase() ?? "-",
    req.collateral ? `${req.collateral.token.toLowerCase()}:${req.collateral.amount}` : "-",
  ].join("|")
}

export function signaturePlan(action: LendingAction, market: Market, collateralSymbol?: string): Array<SignatureStep> {
  const chain = market.ref.chain
  const where = chain === "base" ? "Base" : "Ethereum"
  switch (action) {
    case "lend":
      return [
        { wallet: "stellar", chain: "stellar", label: "Approve the USDC transfer from Stellar" },
        { wallet: "evm", chain, label: `Authorize the supply on ${where} from your execution account` },
      ]
    case "repay":
      return [
        { wallet: "stellar", chain: "stellar", label: "Approve the USDC transfer from Stellar" },
        { wallet: "evm", chain, label: `Authorize the repayment on ${where}` },
      ]
    case "borrow":
      return [
        ...(collateralSymbol
          ? [{ wallet: "evm" as const, chain, label: `Post ${collateralSymbol} as collateral on ${where}` }]
          : []),
        { wallet: "evm", chain, label: `Authorize the borrow on ${where} and the USDC transfer to Stellar` },
      ]
    case "withdraw":
      return [{ wallet: "evm", chain, label: `Authorize the withdrawal on ${where} and the USDC transfer to Stellar` }]
    case "post-collateral":
      return [{ wallet: "evm", chain, label: `Post collateral on ${where}` }]
    case "withdraw-collateral":
      return [{ wallet: "evm", chain, label: `Withdraw collateral on ${where}` }]
  }
}

export function buildQuote(
  req: QuoteRequest,
  market: Market,
  fees: FeeSchedule,
  now: number,
  collateralSymbol?: string
): Quote {
  const legs = actionLegs(req.action)
  const crossesChains = legs.funding === "stellar" || legs.payout === "stellar"
  const lines: Array<FeeLine> = []
  let usdcFees = 0n
  if (crossesChains) {
    const proportional = (req.amount * BigInt(fees.bridgeBps)) / 10_000n
    const bridge = proportional > fees.bridgeMinimum ? proportional : fees.bridgeMinimum
    usdcFees += bridge
    lines.push({ label: "Bridge fee (CCTP, estimate)", amount: bridge, symbol: "USDC", decimals: 6, payer: "you" })
  }
  if (legs.funding === "stellar")
    lines.push({ label: "Stellar network fee", amount: fees.stellarNetworkFee, symbol: "XLM", decimals: 7, payer: "you" })
  lines.push({
    label: `${market.ref.chain === "base" ? "Base" : "Ethereum"} network fee (estimate)`,
    amount: fees.evmGas[market.ref.chain],
    symbol: "ETH",
    decimals: 18,
    payer: fees.gasSponsored ? "sponsor" : "you",
  })
  return {
    fingerprint: quoteFingerprint(req),
    createdAt: now,
    expiresAt: now + QUOTE_TTL_MS,
    fees: lines,
    minimumResult: req.amount > usdcFees ? req.amount - usdcFees : 0n,
    signatures: signaturePlan(req.action, market, collateralSymbol),
  }
}

export function validateQuote(quote: Quote | null, req: QuoteRequest | null, now: number): Array<QuoteIssue> {
  if (!req) return [{ kind: "invalid", message: "Complete the form to get a quote." }]
  if (!quote) return [{ kind: "invalid", message: "No quote yet." }]
  const issues: Array<QuoteIssue> = []
  if (quote.fingerprint !== quoteFingerprint(req))
    issues.push({ kind: "changed", message: "The amount, recipient, market, or wallet changed. Get a new quote." })
  if (now >= quote.expiresAt) issues.push({ kind: "expired", message: "This quote expired. Get a new quote." })
  const usdcFees = quote.fees.filter((f) => f.symbol === "USDC" && f.payer === "you").reduce((sum, f) => sum + f.amount, 0n)
  if (req.amount === 0n || usdcFees * 10_000n > req.amount * MAX_FEE_BPS)
    issues.push({ kind: "fee-too-high", message: "Fees would be more than 1% of the amount. Increase the amount." })
  return issues
}
