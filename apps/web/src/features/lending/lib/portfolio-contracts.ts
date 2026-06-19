import { TOKEN_BY_CONTRACT } from "./astrion-contracts"
import { getIsolatedAccount, getIsolatedMarkets } from "./isolated-market"
import {
  formatTokenAmount,
  formatUsd,
  tokenAmountToNumber,
  wadToNumber,
} from "./stellar-format"
import type {
  LendingPortfolio,
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

/**
 * Aggregate a user's positions across every isolated market.
 *
 * Morpho has no protocol-wide pool: each market is queried via
 * `getIsolatedAccount` (position + per-leg oracle prices + lltv) and the results
 * are summed. Lent supply, posted collateral and debt are three distinct
 * dimensions, and health is per-market — there is no global health factor, so we
 * surface the worst (lowest) across markets that carry debt.
 */
export async function getUserPortfolio(user: string): Promise<LendingPortfolio> {
  const markets = await getIsolatedMarkets()
  if (markets.length === 0) {
    return { positions: [], summary: emptySummary }
  }

  const accounts = await Promise.all(
    markets.map(async (market) => ({
      market,
      account: await getIsolatedAccount(market.id, user).catch(() => null),
    }))
  )

  const positions: Array<Position> = []
  let suppliedUsd = 0
  let collateralUsd = 0
  let debtUsd = 0
  let borrowCapacityUsd = 0
  let supplyApyUsd = 0
  let borrowApyUsd = 0
  let worstHealth: number | null = null

  for (const { market, account } of accounts) {
    if (!account) continue
    const { position, loanPriceWad, collateralPriceWad, loanDecimals, collateralDecimals, lltv } =
      account
    if (
      position.suppliedRaw <= 0n &&
      position.borrowedRaw <= 0n &&
      position.collateralRaw <= 0n
    ) {
      continue
    }

    const loan = TOKEN_BY_CONTRACT[market.loanAsset ?? ""]
    const collateral = TOKEN_BY_CONTRACT[market.collateralAsset ?? ""]
    const loanSymbol = loan?.symbol ?? market.loanSymbol ?? market.symbol
    const collateralSymbol =
      collateral?.symbol ?? market.collateralSymbol ?? ""

    const lentUsd =
      tokenAmountToNumber(position.suppliedRaw, loanDecimals) *
      wadToNumber(loanPriceWad)
    const positionDebtUsd =
      tokenAmountToNumber(position.borrowedRaw, loanDecimals) *
      wadToNumber(loanPriceWad)
    const positionCollateralUsd =
      tokenAmountToNumber(position.collateralRaw, collateralDecimals) *
      wadToNumber(collateralPriceWad)

    suppliedUsd += lentUsd
    debtUsd += positionDebtUsd
    collateralUsd += positionCollateralUsd
    borrowCapacityUsd += positionCollateralUsd * (lltv / 100)
    supplyApyUsd += lentUsd * market.supplyApy
    borrowApyUsd += positionDebtUsd * market.borrowApy
    if (position.healthFactor != null) {
      worstHealth =
        worstHealth == null
          ? position.healthFactor
          : Math.min(worstHealth, position.healthFactor)
    }

    positions.push({
      id: market.id,
      marketId: market.id,
      symbol: loanSymbol,
      supplied: formatTokenAmount(position.suppliedRaw, loanDecimals, loanSymbol),
      suppliedUsd: formatUsd(lentUsd),
      borrowed: formatTokenAmount(position.borrowedRaw, loanDecimals, loanSymbol),
      borrowedUsd: formatUsd(positionDebtUsd),
      collateral: formatTokenAmount(
        position.collateralRaw,
        collateralDecimals,
        collateralSymbol
      ),
      collateralUsd: formatUsd(positionCollateralUsd),
      supplyApy: market.supplyApy,
      borrowApy: market.borrowApy,
      collateralEnabled: position.collateralRaw > 0n,
      healthFactor: position.healthFactor,
      loanAsset: market.loanAsset,
      collateralAsset: market.collateralAsset,
      loanSymbol,
      collateralSymbol,
    })
  }

  const netWorth = suppliedUsd + collateralUsd - debtUsd
  const availableToBorrowUsd = Math.max(0, borrowCapacityUsd - debtUsd)
  const base = Math.max(suppliedUsd, 1)
  const summary: PortfolioSummary = {
    netWorth: formatUsd(netWorth),
    netApy: `${((supplyApyUsd - borrowApyUsd) / base).toFixed(2)}%`,
    totalSupplied: formatUsd(suppliedUsd),
    totalBorrowed: formatUsd(debtUsd),
    totalCollateral: formatUsd(collateralUsd),
    totalDebt: formatUsd(debtUsd),
    availableToBorrow: formatUsd(availableToBorrowUsd),
    healthFactor: debtUsd > 0 ? worstHealth : null,
    netWorthUsd: netWorth,
    totalSuppliedUsd: suppliedUsd,
    totalBorrowedUsd: debtUsd,
    totalCollateralUsd: collateralUsd,
    totalDebtUsd: debtUsd,
    borrowCapacityUsd,
    // Morpho has a single LLTV (no separate liquidation threshold), so
    // liquidation capacity collapses into borrow capacity.
    liquidationCapacityUsd: borrowCapacityUsd,
    availableToBorrowUsd,
  }

  return { positions, summary }
}
