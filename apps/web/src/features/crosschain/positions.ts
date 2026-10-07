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
