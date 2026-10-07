// Protocol-native risk, computed per position (Morpho, Compound) or per
// account and chain (Aave). USD values are bigint scaled by 1e8. Any missing
// input yields "unknown"; nothing is ever pooled across chains or protocols.

import { formatUnits } from "../lending/lib/amounts.ts"
import { priceKey } from "./positions.ts"
import type { AaveReserve, CompoundComet, Market, MorphoMarket, Token } from "./model"
import type { Price } from "./positions"

export type RiskLevel = "healthy" | "attention" | "at-risk" | "unknown"

export type RiskReading = {
  level: RiskLevel
  metric?: { label: string; value: string }
  reason?: string
}

export type Prices = Map<string, Price>

export function usdE8(amount: bigint, token: Token, prices: Prices): bigint | null {
  const price = prices.get(priceKey(token.chain, token.address))
  if (!price) return null
  return (amount * price.usdE8) / 10n ** BigInt(token.decimals)
}

export function formatUsdE8(value: bigint | null) {
  return value === null ? "Unknown" : `$${formatUnits(value, 8, { maxFractionDigits: 2, minFractionDigits: 2 }).text}`
}

const UNKNOWN_PRICE: RiskReading = { level: "unknown", reason: "A price needed to measure this risk is unavailable." }

// Aave health factor = sum(collateral value × liquidation threshold) / debt value.
export function aaveHealth(
  entries: Array<{ market: AaveReserve; supplied: bigint | null; debt: bigint | null; collateralEnabled: boolean }>,
  prices: Prices
): RiskReading {
  let weighted = 0n
  let debt = 0n
  for (const e of entries) {
    if (e.supplied === null || e.debt === null) return { level: "unknown", reason: "A balance could not be read." }
    if (e.collateralEnabled && e.market.collateral.enabled && e.supplied > 0n) {
      const value = usdE8(e.supplied, e.market.asset, prices)
      if (value === null) return UNKNOWN_PRICE
      weighted += (value * BigInt(e.market.collateral.liquidationThresholdBps)) / 10_000n
    }
    if (e.debt > 0n) {
      const value = usdE8(e.debt, e.market.asset, prices)
      if (value === null) return UNKNOWN_PRICE
      debt += value
    }
  }
  if (debt === 0n) return { level: "healthy", metric: { label: "Health factor", value: "No debt" } }
  const hfE2 = (weighted * 100n) / debt
  const value = formatUnits(hfE2, 2, { minFractionDigits: 2 }).text
  const level: RiskLevel = hfE2 < 110n ? "at-risk" : hfE2 < 150n ? "attention" : "healthy"
  return { level, metric: { label: "Health factor", value } }
}

// Debt as a share of the point where liquidation starts. 100% = liquidatable.
function usageLevel(usageBps: bigint): RiskLevel {
  return usageBps >= 9_500n ? "at-risk" : usageBps >= 8_500n ? "attention" : "healthy"
}

export function morphoRisk(
  market: MorphoMarket,
  collateral: bigint | null,
  debt: bigint | null,
  prices: Prices
): RiskReading {
  if (collateral === null || debt === null) return { level: "unknown", reason: "A balance could not be read." }
  if (debt === 0n) return { level: "healthy", metric: { label: "LTV", value: "No debt" } }
  const collateralUsd = usdE8(collateral, market.collateralToken, prices)
  const debtUsd = usdE8(debt, market.loanToken, prices)
  if (collateralUsd === null || debtUsd === null) return UNKNOWN_PRICE
  if (collateralUsd === 0n) return { level: "at-risk", metric: { label: "LTV", value: "No collateral" } }
  const ltvBps = (debtUsd * 10_000n) / collateralUsd
  const usage = (ltvBps * 10_000n) / BigInt(market.lltvBps)
  return {
    level: usageLevel(usage),
    metric: { label: "LTV", value: `${formatUnits(ltvBps, 2, { maxFractionDigits: 1 }).text}% of ${formatUnits(BigInt(market.lltvBps), 2).text}% LLTV` },
  }
}

export function compoundRisk(
  comet: CompoundComet,
  baseBalance: bigint | null,
  collaterals: Record<string, bigint> | undefined,
  prices: Prices
): RiskReading {
  if (baseBalance === null) return { level: "unknown", reason: "The base balance could not be read." }
  if (baseBalance >= 0n) return { level: "healthy", metric: { label: "Borrow capacity used", value: "No debt" } }
  let liquidation = 0n
  for (const c of comet.collaterals) {
    const amount = collaterals?.[priceKey(c.token.chain, c.token.address)] ?? 0n
    if (amount === 0n) continue
    const value = usdE8(amount, c.token, prices)
    if (value === null) return UNKNOWN_PRICE
    liquidation += (value * BigInt(c.liquidateCollateralFactorBps)) / 10_000n
  }
  const debtUsd = usdE8(-baseBalance, comet.baseToken, prices)
  if (debtUsd === null) return UNKNOWN_PRICE
  if (liquidation === 0n) return { level: "at-risk", metric: { label: "Liquidation limit used", value: "No collateral" } }
  const usage = (debtUsd * 10_000n) / liquidation
  return {
    level: usageLevel(usage),
    metric: { label: "Liquidation limit used", value: `${formatUnits(usage, 2, { maxFractionDigits: 1 }).text}%` },
  }
}

export type BorrowPreview = {
  // Most that can be borrowed against this collateral alone, in loan units.
  maxBorrow: bigint | null
  projected: RiskReading
  blockers: Array<string>
}

// Preview a new borrow against freshly posted collateral in ONE market.
// Collateral elsewhere never adds capacity here.
export function previewBorrow(
  market: Market,
  collateralToken: Token,
  collateralAmount: bigint,
  borrowAmount: bigint,
  prices: Prices,
  aaveCollateral?: AaveReserve
): BorrowPreview {
  const blockers: Array<string> = []
  const collateralUsd = usdE8(collateralAmount, collateralToken, prices)
  const loan = market.protocol === "compound-v3" ? market.baseToken : market.protocol === "morpho-blue" ? market.loanToken : market.asset
  const borrowUsd = usdE8(borrowAmount, loan, prices)
  const loanPrice = prices.get(priceKey(loan.chain, loan.address))
  if (collateralUsd === null || borrowUsd === null || !loanPrice)
    return { maxBorrow: null, projected: UNKNOWN_PRICE, blockers: ["A price needed for this borrow is unavailable."] }

  let borrowFactorBps: number
  let projected: RiskReading
  if (market.protocol === "aave-v3") {
    if (!aaveCollateral) return { maxBorrow: null, projected: { level: "unknown" }, blockers: ["Choose collateral."] }
    if (!aaveCollateral.collateral.enabled) blockers.push(`${aaveCollateral.asset.symbol} can't be used as collateral on Aave.`)
    if (aaveCollateral.status !== "active") blockers.push(`The ${aaveCollateral.asset.symbol} reserve is ${aaveCollateral.status}; it can't take new collateral.`)
    if (aaveCollateral.restrictions.some((r) => /isolation|siloed/i.test(r)))
      blockers.push("This collateral uses a risk mode Astrion doesn't support yet.")
    borrowFactorBps = aaveCollateral.collateral.ltvBps
    projected = aaveHealth(
      [
        { market: aaveCollateral, supplied: collateralAmount, debt: 0n, collateralEnabled: true },
        { market, supplied: 0n, debt: borrowAmount, collateralEnabled: false },
      ],
      prices
    )
  } else if (market.protocol === "morpho-blue") {
    if (collateralToken.address !== market.collateralToken.address)
      blockers.push(`This market only accepts ${market.collateralToken.symbol} as collateral.`)
    // Borrowing right up to LLTV is immediately liquidatable; keep a 5-point buffer.
    borrowFactorBps = Math.max(0, market.lltvBps - 500)
    projected = morphoRisk(market, collateralAmount, borrowAmount, prices)
  } else {
    const asset = market.collaterals.find((c) => c.token.address === collateralToken.address)
    if (!asset) {
      blockers.push(`${collateralToken.symbol} isn't accepted by this Comet.`)
      borrowFactorBps = 0
    } else {
      borrowFactorBps = asset.borrowCollateralFactorBps
      if (asset.totalSupplied === null) blockers.push(`The ${asset.token.symbol} supply cap couldn't be checked.`)
      else if (asset.totalSupplied + collateralAmount > asset.supplyCap)
        blockers.push(`The ${asset.token.symbol} collateral supply cap would be exceeded.`)
    }
    if (borrowAmount > 0n && borrowAmount < market.baseBorrowMin)
      blockers.push(`Compound requires a borrow of at least ${formatUnits(market.baseBorrowMin, market.baseToken.decimals).text} ${market.baseToken.symbol}.`)
    projected = compoundRisk(market, -borrowAmount, { [priceKey(collateralToken.chain, collateralToken.address)]: collateralAmount }, prices)
  }

  const maxUsd = (collateralUsd * BigInt(borrowFactorBps)) / 10_000n
  const maxBorrow = (maxUsd * 10n ** BigInt(loan.decimals)) / loanPrice.usdE8
  if (borrowAmount > maxBorrow) blockers.push("This borrow is more than the collateral supports.")
  if (market.availableLiquidity === null) blockers.push("Available liquidity is unknown, so the borrow can't be checked.")
  else if (borrowAmount > market.availableLiquidity) blockers.push("The market doesn't have enough liquidity for this borrow.")
  return { maxBorrow, projected, blockers }
}
