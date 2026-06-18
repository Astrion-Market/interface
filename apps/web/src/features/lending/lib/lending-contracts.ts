import { Address, nativeToScVal, xdr } from "@stellar/stellar-sdk"
import {
  CONTRACTS,
  CORE_MARKET_ASSETS,
  TOKEN_BY_CONTRACT,
} from "./astrion-contracts"
import {
  formatCompactToken,
  formatOracleUpdated,
  tokenAmountToNumber,
  wadToNumber,
  wadToPercent,
} from "./stellar-format"
import { addressArg, callReadContract, i128Arg } from "./soroban"
import type { Market } from "../types/lending"

type RawMarketConfig = {
  asset: string
  ltv: bigint
  liquidation_threshold: bigint
  liquidation_bonus: bigint
  reserve_factor: bigint
  supply_cap: bigint
  borrow_cap: bigint
  is_active: boolean
  is_borrowable: boolean
}

type RawMarketState = {
  supply_index: bigint
  borrow_index: bigint
  total_scaled_supply: bigint
  total_scaled_borrow: bigint
  protocol_reserves: bigint
  last_update_timestamp: bigint
}

type RateSnapshot = {
  borrow_rate: bigint
  supply_rate: bigint
  utilization: bigint
}

type ResolvedPrice = {
  price_wad: bigint
  timestamp: bigint
  source: string
}

export async function getCoreMarketIds(): Promise<Array<string>> {
  try {
    const markets = await callReadContract<Array<string>>(
      CONTRACTS.corePool,
      "get_markets"
    )
    return markets.length > 0 ? markets : [...CORE_MARKET_ASSETS]
  } catch {
    return [...CORE_MARKET_ASSETS]
  }
}

async function getMarketConfig(asset: string) {
  return callReadContract<RawMarketConfig | null>(
    CONTRACTS.corePool,
    "get_market_config",
    [addressArg(asset)]
  )
}

async function getMarketState(asset: string) {
  return callReadContract<RawMarketState | null>(
    CONTRACTS.corePool,
    "get_market_state",
    [addressArg(asset)]
  )
}

async function getRates(totalBorrowed: bigint, totalSupplied: bigint) {
  return callReadContract<RateSnapshot>(CONTRACTS.rateModel, "get_rates", [
    i128Arg(totalBorrowed),
    i128Arg(totalSupplied),
  ])
}

async function getTokenPrice(asset: string) {
  const stellarAsset = xdr.ScVal.scvVec([
    nativeToScVal("Stellar", { type: "symbol" }),
    Address.fromString(asset).toScVal(),
  ])

  return callReadContract<ResolvedPrice>(CONTRACTS.oracleAdapter, "get_price", [
    stellarAsset,
  ])
}

function indexedAmount(scaled: bigint, index: bigint) {
  return (scaled * index) / 1_000_000_000_000_000_000n
}

export async function getCoreMarket(asset: string): Promise<Market | null> {
  const [config, state] = await Promise.all([
    getMarketConfig(asset),
    getMarketState(asset),
  ])
  const token = TOKEN_BY_CONTRACT[asset]

  if (!config || !state || !token || !config.is_active) {
    return null
  }

  const totalSuppliedRaw = indexedAmount(
    state.total_scaled_supply,
    state.supply_index
  )
  const totalBorrowedRaw = indexedAmount(
    state.total_scaled_borrow,
    state.borrow_index
  )
  const availableRaw = totalSuppliedRaw - totalBorrowedRaw

  const [rates, price] = await Promise.allSettled([
    getRates(totalBorrowedRaw, totalSuppliedRaw),
    getTokenPrice(asset),
  ])

  const rateSnapshot =
    rates.status === "fulfilled"
      ? rates.value
      : { borrow_rate: 0n, supply_rate: 0n, utilization: 0n }
  const oraclePrice =
    price.status === "fulfilled" ? wadToNumber(price.value.price_wad) : 0

  const totalSupplied = tokenAmountToNumber(totalSuppliedRaw, token.decimals)
  const totalBorrowed = tokenAmountToNumber(totalBorrowedRaw, token.decimals)
  const availableLiquidity = tokenAmountToNumber(
    availableRaw > 0n ? availableRaw : 0n,
    token.decimals
  )

  return {
    id: asset,
    symbol: token.symbol,
    name: token.name,
    type: "core",
    supplyApy: wadToPercent(rateSnapshot.supply_rate),
    borrowApy: wadToPercent(rateSnapshot.borrow_rate),
    utilization: Math.min(
      100,
      Math.max(0, wadToPercent(rateSnapshot.utilization))
    ),
    totalSupplied: formatCompactToken(totalSupplied, token.symbol),
    totalBorrowed: formatCompactToken(totalBorrowed, token.symbol),
    availableLiquidity: formatCompactToken(availableLiquidity, token.symbol),
    ltv: wadToPercent(config.ltv),
    liquidationThreshold: wadToPercent(config.liquidation_threshold),
    liquidationPenalty: wadToPercent(config.liquidation_bonus),
    oracle:
      oraclePrice > 0 ? `$${oraclePrice.toLocaleString("en-US")}` : "Oracle",
    oraclePrice,
    oracleUpdated:
      price.status === "fulfilled"
        ? formatOracleUpdated(price.value.timestamp)
        : "Unavailable",
    borrowCap:
      config.borrow_cap > 0n
        ? formatCompactToken(
            tokenAmountToNumber(config.borrow_cap, token.decimals),
            token.symbol
          )
        : undefined,
  }
}

export async function getCoreMarkets(): Promise<Array<Market>> {
  const marketIds = await getCoreMarketIds()
  const markets = await Promise.all(
    marketIds.map((asset) => getCoreMarket(asset))
  )

  return markets.filter((market): market is Market => market !== null)
}
