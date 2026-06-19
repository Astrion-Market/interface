import { Address, nativeToScVal, xdr } from "@stellar/stellar-sdk"
import { CONTRACTS, TOKEN_BY_CONTRACT } from "./astrion-contracts"
import {
  WAD,
  formatCompactToken,
  formatOracleUpdated,
  tokenAmountToNumber,
  wadToNumber,
  wadToPercent,
} from "./stellar-format"
import { addressArg, callReadContract, i128Arg } from "./soroban"
import type { Market } from "../types/lending"

// Morpho virtual-share offsets at the market level (see whitepaper §share math).
const VIRTUAL_SHARES = 1_000_000n // 1e6
const VIRTUAL_ASSETS = 1n
// Morpho liquidation incentive: lif = min(MAX_LIF, 1 / (1 - CURSOR * (1 - lltv)))
const MAX_LIF = (115n * WAD) / 100n // 1.15
const LIQ_CURSOR = (3n * WAD) / 10n // 0.30

type MarketParams = {
  loan_asset: string
  collateral_asset: string
  oracle_adapter: string
  rate_model: string
  lltv: bigint
}
type MarketState = {
  total_supply_assets: bigint
  total_supply_shares: bigint
  total_borrow_assets: bigint
  total_borrow_shares: bigint
  total_collateral: bigint
  fee_assets: bigint
  last_update_timestamp: bigint
}
type RawPosition = {
  supply_shares: bigint
  borrow_shares: bigint
  collateral: bigint
}
type RateSnapshot = {
  borrow_rate: bigint
  supply_rate: bigint
  utilization: bigint
}
type ResolvedPrice = { price_wad: bigint; timestamp: bigint; source: string }

// shares -> assets, rounded down (display a lender's claim conservatively).
export function toAssetsDown(
  shares: bigint,
  totalAssets: bigint,
  totalShares: bigint
) {
  return (
    (shares * (totalAssets + VIRTUAL_ASSETS)) / (totalShares + VIRTUAL_SHARES)
  )
}

// shares -> assets, rounded up (never understate a borrower's debt).
export function toAssetsUp(
  shares: bigint,
  totalAssets: bigint,
  totalShares: bigint
) {
  const num = shares * (totalAssets + VIRTUAL_ASSETS)
  const den = totalShares + VIRTUAL_SHARES
  return (num + den - 1n) / den
}

function liquidationIncentive(lltv: bigint): bigint {
  const denom = WAD - (LIQ_CURSOR * (WAD - lltv)) / WAD
  if (denom <= 0n) return MAX_LIF
  const lif = (WAD * WAD) / denom
  return lif < MAX_LIF ? lif : MAX_LIF
}

function getParams(market: string) {
  return callReadContract<MarketParams | null>(market, "get_market_params")
}
function getState(market: string) {
  return callReadContract<MarketState | null>(market, "get_market_state")
}
function getRates(totalBorrowed: bigint, totalSupplied: bigint) {
  return callReadContract<RateSnapshot>(CONTRACTS.rateModel, "get_rates", [
    i128Arg(totalBorrowed),
    i128Arg(totalSupplied),
  ])
}
export function getPrice(asset: string) {
  const assetArg = xdr.ScVal.scvVec([
    nativeToScVal("Stellar", { type: "symbol" }),
    Address.fromString(asset).toScVal(),
  ])
  return callReadContract<ResolvedPrice>(CONTRACTS.oracleAdapter, "get_price", [
    assetArg,
  ])
}

export async function getMarketAddresses(): Promise<Array<string>> {
  try {
    return await callReadContract<Array<string>>(
      CONTRACTS.marketFactory,
      "get_markets"
    )
  } catch {
    return []
  }
}

export async function getIsolatedMarket(market: string): Promise<Market | null> {
  const [params, state] = await Promise.all([
    getParams(market),
    getState(market),
  ])
  if (!params || !state) return null
  const loan = TOKEN_BY_CONTRACT[params.loan_asset]
  const collateral = TOKEN_BY_CONTRACT[params.collateral_asset]
  if (!loan || !collateral) return null

  const totalSuppliedRaw = state.total_supply_assets
  const totalBorrowedRaw = state.total_borrow_assets
  const availableRaw =
    totalSuppliedRaw > totalBorrowedRaw
      ? totalSuppliedRaw - totalBorrowedRaw
      : 0n

  const [rates, price] = await Promise.allSettled([
    getRates(totalBorrowedRaw, totalSuppliedRaw),
    getPrice(params.collateral_asset),
  ])
  const rate =
    rates.status === "fulfilled"
      ? rates.value
      : { borrow_rate: 0n, supply_rate: 0n, utilization: 0n }
  const oraclePrice =
    price.status === "fulfilled" ? wadToNumber(price.value.price_wad) : 0
  const lltvPct = wadToPercent(params.lltv)
  const penaltyPct = wadToPercent(liquidationIncentive(params.lltv) - WAD)

  return {
    id: market, // market CONTRACT address (not an asset)
    symbol: loan.symbol,
    name: `${collateral.symbol} / ${loan.symbol}`,
    type: "isolated",
    supplyApy: wadToPercent(rate.supply_rate),
    borrowApy: wadToPercent(rate.borrow_rate),
    utilization: Math.min(100, Math.max(0, wadToPercent(rate.utilization))),
    totalSupplied: formatCompactToken(
      tokenAmountToNumber(totalSuppliedRaw, loan.decimals),
      loan.symbol
    ),
    totalBorrowed: formatCompactToken(
      tokenAmountToNumber(totalBorrowedRaw, loan.decimals),
      loan.symbol
    ),
    availableLiquidity: formatCompactToken(
      tokenAmountToNumber(availableRaw, loan.decimals),
      loan.symbol
    ),
    ltv: lltvPct, // single LLTV mirrored into both fields the legacy UI expects
    liquidationThreshold: lltvPct,
    liquidationPenalty: penaltyPct,
    oracle:
      oraclePrice > 0 ? `$${oraclePrice.toLocaleString("en-US")}` : "Oracle",
    oraclePrice,
    oracleUpdated:
      price.status === "fulfilled"
        ? formatOracleUpdated(price.value.timestamp)
        : "Unavailable",
    loanAsset: params.loan_asset,
    collateralAsset: params.collateral_asset,
    loanSymbol: loan.symbol,
    collateralSymbol: collateral.symbol,
    loanDecimals: loan.decimals,
    collateralDecimals: collateral.decimals,
    lltv: lltvPct,
  }
}

export async function getIsolatedMarkets(): Promise<Array<Market>> {
  const addresses = await getMarketAddresses()
  const markets = await Promise.all(
    addresses.map((a) => getIsolatedMarket(a).catch(() => null))
  )
  return markets.filter((m): m is Market => m !== null)
}

export type IsolatedPosition = {
  market: string
  loanAsset: string
  collateralAsset: string
  // Raw supply shares / borrow shares — pass as `shares` for max withdraw/repay
  // (avoids interest-accrual dust between quote and submit).
  supplyShares: bigint
  borrowShares: bigint
  suppliedRaw: bigint // lent loan asset (shares -> assets down)
  borrowedRaw: bigint // debt (shares -> assets up)
  collateralRaw: bigint
  healthFactor: number | null
}

export async function getIsolatedPosition(
  market: string,
  user: string
): Promise<IsolatedPosition | null> {
  const [params, state, position, health] = await Promise.all([
    getParams(market),
    getState(market),
    callReadContract<RawPosition | null>(market, "get_user_position", [
      addressArg(user),
    ]).catch(() => null),
    callReadContract<bigint>(market, "get_health_factor", [
      addressArg(user),
    ]).catch(() => null),
  ])
  if (!params || !state || !position) return null
  const borrowedRaw = toAssetsUp(
    position.borrow_shares,
    state.total_borrow_assets,
    state.total_borrow_shares
  )
  const suppliedRaw = toAssetsDown(
    position.supply_shares,
    state.total_supply_assets,
    state.total_supply_shares
  )
  return {
    market,
    loanAsset: params.loan_asset,
    collateralAsset: params.collateral_asset,
    supplyShares: position.supply_shares,
    borrowShares: position.borrow_shares,
    suppliedRaw,
    borrowedRaw,
    collateralRaw: position.collateral,
    healthFactor:
      borrowedRaw > 0n && health !== null ? wadToNumber(health) : null,
  }
}
