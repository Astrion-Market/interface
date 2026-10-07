// Position and risk shapes. Each protocol measures risk differently, so risk is
// a tagged union rather than one global health factor.

import type { ExecutionChainId } from "../lending/lib/identity"

export type PositionRisk =
  // Aave: account-level health factor, WAD-scaled (below 1e18 is liquidatable).
  | { kind: "aave-health-factor"; healthFactorWad: bigint }
  // Morpho Blue: per-market loan-to-value against that market's LLTV.
  | { kind: "morpho-ltv"; ltvBps: number; lltvBps: number }
  // Compound III: collateral value left before liquidation, in base units.
  | { kind: "compound-liquidity"; liquidityBase: bigint }
  // The read failed or is incomplete. Never shown as safe.
  | { kind: "unknown"; reason: string }

// Compound III stores one signed principal per account for the base asset:
// positive is supply, negative is debt. The account can never have both.
export type CometBaseBalance =
  | { kind: "none" }
  | { kind: "supplied"; amount: bigint }
  | { kind: "borrowed"; amount: bigint }

export function cometBaseBalance(signedPrincipal: bigint): CometBaseBalance {
  if (signedPrincipal > 0n) return { kind: "supplied", amount: signedPrincipal }
  if (signedPrincipal < 0n) return { kind: "borrowed", amount: -signedPrincipal }
  return { kind: "none" }
}

export type Owner = {
  stellar: string | null
  evm: string | null
}

export type PositionScope = {
  chain: ExecutionChainId
  // The execution account that holds the position, not the wallet itself.
  account: string
}

export type Price = { usdE8: bigint; readAt: string }

// Price lookup key: chain plus lowercase token address.
export function priceKey(chain: ExecutionChainId, address: string) {
  return `${chain}:${address.toLowerCase()}`
}

export type FeeSchedule = {
  bridgeBps: number
  // Minimum bridge fee in USDC raw units (6 decimals).
  bridgeMinimum: bigint
  // Stellar base fee in stroops.
  stellarNetworkFee: bigint
  evmGas: Record<ExecutionChainId, bigint>
  gasSponsored: boolean
}

// One protocol read for one market. Null fields were not reported; they are
// never treated as zero.
export type PositionRead = {
  marketKey: string
  readAt: string
  // True when the balance matched a direct protocol read; null if unchecked.
  reconciled: boolean | null
  supplied: bigint | null
  debt: bigint | null
  // Aave: the supplied asset also backs borrowing.
  collateralEnabled?: boolean
  // Morpho: collateral of the market's collateral token.
  collateral?: bigint | null
  // Compound: signed base principal and per-asset collateral.
  baseBalance?: bigint | null
  collaterals?: Record<string, bigint>
}

export type FailedRead = { chain: ExecutionChainId; protocol: string; reason: string }

export type Portfolio = {
  note: string
  owner: Owner
  accounts: Partial<Record<ExecutionChainId, string>>
  positions: Array<PositionRead>
  failedReads: Array<FailedRead>
}
