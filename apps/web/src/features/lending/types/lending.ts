export type MarketType = "core" | "isolated"

export type Market = {
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
  ltv: number
  liquidationThreshold: number
  liquidationPenalty: number
  oracle: string
  oraclePrice?: number
  oracleUpdated: string
  borrowCap?: string
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
  collateralEnabled: boolean
  healthFactor: number | null
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
