// Chain-aware lending model for cross-chain markets. Legacy Stellar lending
// keeps its own types in features/lending/types; nothing here reads Soroban.
//
// Amounts are raw integer token units (bigint). Rates are display values and
// never construct a signed amount. A `null` reading means unknown, which the
// UI must never render as zero.

import type { ExecutionChainId, ProtocolId } from "../lending/lib/identity"

export type Address = `0x${string}`
export type Env = "fixture" | "testnet" | "mainnet"

export type Token = {
  chain: ExecutionChainId
  address: Address
  symbol: string
  decimals: number
}

export type MarketRef =
  | { protocol: "aave-v3"; chain: ExecutionChainId; pool: Address; asset: Address }
  | { protocol: "morpho-blue"; chain: ExecutionChainId; marketId: Address }
  | { protocol: "compound-v3"; chain: ExecutionChainId; comet: Address }

// Identifier used in /markets/$chain/$protocol/$marketId.
export function marketPathId(ref: MarketRef): string {
  switch (ref.protocol) {
    case "aave-v3":
      return ref.asset
    case "morpho-blue":
      return ref.marketId
    case "compound-v3":
      return ref.comet
  }
}

// Globally unique, case-insensitive key. Two markets that share token
// symbols still get different keys because the on-chain identity differs.
export function marketKey(ref: MarketRef): string {
  return `${ref.chain}:${ref.protocol}:${marketPathId(ref).toLowerCase()}`
}

export type Rate = {
  // Aave and Morpho report compounding APY; Compound III exposes a per-second
  // rate that we annualize without compounding (APR).
  basis: "APY" | "APR"
  // Decimal percent string, e.g. "4.12". "0" is a real zero rate.
  percent: string
}

export type Cap = { kind: "none" } | { kind: "limit"; amount: bigint }

export type LendingAction =
  | "lend"
  | "withdraw"
  | "post-collateral"
  | "withdraw-collateral"
  | "borrow"
  | "repay"

export type DataState = "live" | "partial" | "unavailable"

type MarketCommon = {
  key: string
  env: Env
  name: string
  // ISO timestamp of the last successful read, or null if never read.
  readAt: string | null
  dataState: DataState
  // True only when the address/ID matches a verified deployment manifest (C05).
  verified: boolean
}

export type AaveReserve = MarketCommon & {
  protocol: "aave-v3"
  ref: Extract<MarketRef, { protocol: "aave-v3" }>
  asset: Token
  status: "active" | "frozen" | "paused"
  supplyRate: Rate | null
  borrowRate: Rate | null
  totalSupplied: bigint | null
  totalBorrowed: bigint | null
  availableLiquidity: bigint | null
  supplyCap: Cap | null
  borrowCap: Cap | null
  borrowable: boolean
  collateral: {
    enabled: boolean
    ltvBps: number
    liquidationThresholdBps: number
    liquidationBonusBps: number
  }
  // Isolation mode, siloed borrowing, E-Mode categories, and similar limits.
  restrictions: Array<string>
}

export type MorphoMarket = MarketCommon & {
  protocol: "morpho-blue"
  ref: Extract<MarketRef, { protocol: "morpho-blue" }>
  loanToken: Token
  collateralToken: Token
  oracle: Address
  irm: Address
  lltvBps: number
  supplyRate: Rate | null
  borrowRate: Rate | null
  totalSupplied: bigint | null
  totalBorrowed: bigint | null
  availableLiquidity: bigint | null
  // Morpho Blue markets are permissionless. Only markets on Astrion's
  // reviewed list may ever become actionable, whatever an API returns.
  approved: boolean
  listedBy: "registry" | "discovery-api"
}

export type CometCollateral = {
  token: Token
  borrowCollateralFactorBps: number
  liquidateCollateralFactorBps: number
  liquidationFactorBps: number
  supplyCap: bigint
  totalSupplied: bigint | null
  // Collateral in Compound III never earns supply interest. There is no rate
  // field on purpose.
}

export type CompoundComet = MarketCommon & {
  protocol: "compound-v3"
  ref: Extract<MarketRef, { protocol: "compound-v3" }>
  baseToken: Token
  baseSupplyRate: Rate | null
  baseBorrowRate: Rate | null
  baseBorrowMin: bigint
  totalSupplied: bigint | null
  totalBorrowed: bigint | null
  availableLiquidity: bigint | null
  paused: Array<LendingAction>
  collaterals: Array<CometCollateral>
}

export type Market = AaveReserve | MorphoMarket | CompoundComet

export type RouteAvailability = {
  chain: ExecutionChainId
  protocol: ProtocolId
  enabled: boolean
  // Required when disabled; shown to the user next to the disabled action.
  reason: string | null
}

export function loanToken(market: Market): Token {
  switch (market.protocol) {
    case "aave-v3":
      return market.asset
    case "morpho-blue":
      return market.loanToken
    case "compound-v3":
      return market.baseToken
  }
}

export function lendRate(market: Market): Rate | null {
  return market.protocol === "compound-v3" ? market.baseSupplyRate : market.supplyRate
}

export function borrowRate(market: Market): Rate | null {
  return market.protocol === "compound-v3" ? market.baseBorrowRate : market.borrowRate
}

// Which actions a market type offers at all, before any availability check.
export function marketActions(market: Market): Array<LendingAction> {
  switch (market.protocol) {
    case "aave-v3":
      // Supplying an Aave reserve is also how it becomes collateral.
      return market.borrowable
        ? ["lend", "withdraw", "borrow", "repay"]
        : ["lend", "withdraw"]
    case "morpho-blue":
    case "compound-v3":
      return ["lend", "withdraw", "post-collateral", "withdraw-collateral", "borrow", "repay"]
  }
}

export type ActionAvailability = {
  action: LendingAction
  available: boolean
  reasons: Array<string>
}

function capReached(cap: Cap | null, used: bigint | null): boolean {
  return cap?.kind === "limit" && used !== null && used >= cap.amount
}

// Every reason an action is blocked, most general first. An action is only
// available when the route is enabled, the data is readable, the address is
// verified, and the protocol itself allows it.
export function actionAvailability(
  market: Market,
  route: RouteAvailability | undefined
): Array<ActionAvailability> {
  const general: Array<string> = []
  if (!route) general.push("No route is configured for this chain and protocol.")
  else if (!route.enabled) general.push(route.reason ?? "This route is disabled.")
  if (!market.verified) general.push("Addresses are not yet verified against a deployment manifest.")
  if (market.dataState === "unavailable") general.push("Market data could not be read.")

  return marketActions(market).map((action) => {
    const reasons = [...general]
    if (market.protocol === "aave-v3") {
      if (market.status === "paused") reasons.push("This reserve is paused.")
      if (market.status === "frozen" && (action === "lend" || action === "borrow"))
        reasons.push("This reserve is frozen: only withdraw and repay are allowed.")
      if (action === "lend" && capReached(market.supplyCap, market.totalSupplied))
        reasons.push("The supply cap is reached.")
      if (action === "borrow" && capReached(market.borrowCap, market.totalBorrowed))
        reasons.push("The borrow cap is reached.")
    }
    if (market.protocol === "morpho-blue" && !market.approved)
      reasons.push("This market is not on Astrion's approved list.")
    if (market.protocol === "compound-v3" && market.paused.includes(action))
      reasons.push("Paused by Compound governance.")
    return { action, available: reasons.length === 0, reasons }
  })
}

export const ACTION_LABEL: Record<LendingAction, string> = {
  lend: "Lend",
  withdraw: "Withdraw",
  "post-collateral": "Post collateral",
  "withdraw-collateral": "Withdraw collateral",
  borrow: "Borrow",
  repay: "Repay",
}
