export type MarketType = "core" | "isolated"

export type Market = {
  // For isolated markets this is the market CONTRACT address; for legacy core
  // markets it is the asset address.
  id: string
  symbol: string
  name: string
  type: MarketType
  supplyApy: number
  borrowApy: number
  utilization: number
  totalSupplied: string
  totalBorrowed: string
  availableLiquidity: string
  // Isolated markets expose a single LLTV; `ltv` and `liquidationThreshold` are
  // both mirrored from it so existing UI keeps working.
  ltv: number
  liquidationThreshold: number
  liquidationPenalty: number
  oracle: string
  oraclePrice?: number
  oracleUpdated: string
  borrowCap?: string
  // Morpho isolated-market fields (undefined for legacy core markets). An
  // isolated market has two distinct tokens: the loan asset (lent/borrowed) and
  // the collateral asset (posted, earns nothing).
  loanAsset?: string
  collateralAsset?: string
  loanSymbol?: string
  collateralSymbol?: string
  loanDecimals?: number
  collateralDecimals?: number
  lltv?: number
}

export type Position = {
  id: string
  marketId: string
  symbol: string
  supplied: string
  suppliedUsd: string
  borrowed: string
  borrowedUsd: string
  supplyApy: number
  borrowApy: number
  // In Morpho "has collateral" is `collateral > 0`, not a user toggle.
  collateralEnabled: boolean
  healthFactor: number | null
  // Posted collateral, separate from lent supply (isolated markets).
  collateral?: string
  collateralUsd?: string
  // Routing for the transaction dialog: the market is isolated, so an action
  // must know the loan vs collateral token (marketId is the market CONTRACT, not
  // a token). Undefined for legacy core positions.
  loanAsset?: string
  collateralAsset?: string
  loanSymbol?: string
  collateralSymbol?: string
}

export type PortfolioSummary = {
  netWorth: string
  netApy: string
  totalSupplied: string
  totalBorrowed: string
  totalCollateral: string
  totalDebt: string
  availableToBorrow: string
  healthFactor: number | null
  netWorthUsd: number
  totalSuppliedUsd: number
  totalBorrowedUsd: number
  totalCollateralUsd: number
  totalDebtUsd: number
  borrowCapacityUsd: number
  liquidationCapacityUsd: number
  availableToBorrowUsd: number
}

export type LendingPortfolio = {
  positions: Array<Position>
  summary: PortfolioSummary
}

export type Proposal = {
  id: string
  title: string
  description: string
  status: "active" | "passed" | "rejected" | "pending"
  votesFor: number
  votesAgainst: number
  quorum: number
  deadline: string
  proposer: string
  category: "risk" | "market" | "fee" | "protocol"
}
