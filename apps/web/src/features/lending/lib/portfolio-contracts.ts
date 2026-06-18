import { CONTRACTS, TOKEN_BY_CONTRACT } from "./astrion-contracts"
import { getCoreMarkets } from "./lending-contracts"
import {
  formatTokenAmount,
  formatUsd,
  tokenAmountToNumber,
  wadToNumber,
} from "./stellar-format"
import { addressArg, callReadContract } from "./soroban"
import type {
  LendingPortfolio,
  Market,
  PortfolioSummary,
  Position,
} from "../types/lending"

const emptySummary: PortfolioSummary = {
  netWorth: "$0.00",
  netApy: "0.00%",
  totalSupplied: "$0.00",
  totalBorrowed: "$0.00",
  totalCollateral: "$0.00",
  totalDebt: "$0.00",
  availableToBorrow: "$0.00",
  healthFactor: null,
  netWorthUsd: 0,
  totalSuppliedUsd: 0,
  totalBorrowedUsd: 0,
  totalCollateralUsd: 0,
  totalDebtUsd: 0,
  borrowCapacityUsd: 0,
  liquidationCapacityUsd: 0,
  availableToBorrowUsd: 0,
}

async function getSupplyBalance(user: string, asset: string) {
  return callReadContract<bigint>(CONTRACTS.corePool, "get_supply_balance", [
    addressArg(user),
    addressArg(asset),
  ])
}

async function getBorrowBalance(user: string, asset: string) {
  return callReadContract<bigint>(CONTRACTS.corePool, "get_borrow_balance", [
    addressArg(user),
    addressArg(asset),
  ])
}

async function getHealthFactor(user: string) {
  return callReadContract<bigint>(CONTRACTS.corePool, "get_health_factor", [
    addressArg(user),
  ])
}

function toFiniteAmount(raw: bigint | number | string | null | undefined) {
  if (raw == null) return 0n
  return BigInt(raw)
}

function buildPosition(
  market: Market,
  supplyRaw: bigint,
  borrowRaw: bigint,
  healthFactor: number | null
): Position | null {
  const token = TOKEN_BY_CONTRACT[market.id]
  if (!token) return null

  const suppliedAmount = tokenAmountToNumber(supplyRaw, token.decimals)
  const borrowedAmount = tokenAmountToNumber(borrowRaw, token.decimals)
  if (suppliedAmount <= 0 && borrowedAmount <= 0) return null

  const oraclePrice = market.oraclePrice ?? 0
  const suppliedUsd = suppliedAmount * oraclePrice
  const borrowedUsd = borrowedAmount * oraclePrice

  return {
    id: `${market.id}-${token.symbol}`,
    marketId: market.id,
    symbol: token.symbol,
    supplied: formatTokenAmount(supplyRaw, token.decimals, token.symbol),
    suppliedUsd: formatUsd(suppliedUsd),
    borrowed: formatTokenAmount(borrowRaw, token.decimals, token.symbol),
    borrowedUsd: formatUsd(borrowedUsd),
    supplyApy: market.supplyApy,
    borrowApy: market.borrowApy,
    collateralEnabled: suppliedAmount > 0,
    healthFactor,
  }
}

function buildSummary(
  balances: Array<{ market: Market; supplyRaw: bigint; borrowRaw: bigint }>,
  healthFactor: number | null
): PortfolioSummary {
  if (balances.length === 0) return emptySummary

  let suppliedUsd = 0
  let borrowedUsd = 0
  let borrowCapacityUsd = 0
  let liquidationCapacityUsd = 0
  let supplyApyUsd = 0
  let borrowApyUsd = 0

  for (const { market, supplyRaw, borrowRaw } of balances) {
    const token = TOKEN_BY_CONTRACT[market.id]
    if (!token) continue

    const price = market.oraclePrice ?? 0
    const supplied = tokenAmountToNumber(supplyRaw, token.decimals) * price
    const borrowed = tokenAmountToNumber(borrowRaw, token.decimals) * price

    suppliedUsd += supplied
    borrowedUsd += borrowed
    borrowCapacityUsd += supplied * (market.ltv / 100)
    liquidationCapacityUsd += supplied * (market.liquidationThreshold / 100)
    supplyApyUsd += supplied * market.supplyApy
    borrowApyUsd += borrowed * market.borrowApy
  }

  const netWorth = suppliedUsd - borrowedUsd
  const availableToBorrow = Math.max(0, borrowCapacityUsd - borrowedUsd)
  const weightedBase = Math.max(suppliedUsd, 1)
  const netApy = (supplyApyUsd - borrowApyUsd) / weightedBase
  const hasDebt = borrowedUsd > 0

  return {
    netWorth: formatUsd(netWorth),
    netApy: `${netApy.toFixed(2)}%`,
    totalSupplied: formatUsd(suppliedUsd),
    totalBorrowed: formatUsd(borrowedUsd),
    totalCollateral: formatUsd(suppliedUsd),
    totalDebt: formatUsd(borrowedUsd),
    availableToBorrow: formatUsd(availableToBorrow),
    healthFactor: hasDebt ? healthFactor : null,
    netWorthUsd: netWorth,
    totalSuppliedUsd: suppliedUsd,
    totalBorrowedUsd: borrowedUsd,
    totalCollateralUsd: suppliedUsd,
    totalDebtUsd: borrowedUsd,
    borrowCapacityUsd,
    liquidationCapacityUsd,
    availableToBorrowUsd: availableToBorrow,
  }
}

export async function getUserPortfolio(user: string): Promise<LendingPortfolio> {
  const markets = await getCoreMarkets()
  if (markets.length === 0) {
    return { positions: [], summary: emptySummary }
  }

  const [healthResult, balanceResults] = await Promise.all([
    getHealthFactor(user).catch(() => null),
    Promise.all(
      markets.map(async (market) => {
        const [supplyRaw, borrowRaw] = await Promise.all([
          getSupplyBalance(user, market.id).catch(() => 0n),
          getBorrowBalance(user, market.id).catch(() => 0n),
        ])

        return {
          market,
          supplyRaw: toFiniteAmount(supplyRaw),
          borrowRaw: toFiniteAmount(borrowRaw),
        }
      })
    ),
  ])

  const hasBorrow = balanceResults.some(({ borrowRaw }) => borrowRaw > 0n)
  const healthFactor =
    hasBorrow && healthResult !== null ? wadToNumber(healthResult) : null
  const positions = balanceResults
    .map(({ market, supplyRaw, borrowRaw }) =>
      buildPosition(market, supplyRaw, borrowRaw, healthFactor)
    )
    .filter((position): position is Position => position !== null)

  return {
    positions,
    summary: buildSummary(balanceResults, healthFactor),
  }
}
