// Parses the interface-draft market fixture into typed models. Every amount
// arrives as a decimal integer string and becomes a bigint; a number in an
// amount field is rejected so floating point can never reach a signed value.
// C03 schemas and C16 SDK artifacts replace this format; keep the parser
// strict so drift fails loudly in `bun run test`.

import { EXECUTION_CHAIN_IDS, PROTOCOL_IDS } from "../lending/lib/identity.ts"
import { marketKey } from "./model.ts"
import type { ExecutionChainId, ProtocolId } from "../lending/lib/identity"
import type {
  AaveReserve,
  Address,
  Cap,
  CometCollateral,
  CompoundComet,
  DataState,
  Env,
  LendingAction,
  Market,
  MorphoMarket,
  Rate,
  RouteAvailability,
  Token,
} from "./model"

export const FIXTURE_SCHEMA = "astrion.crosschain-markets"
export const FIXTURE_VERSION = "0-interface-draft"

export class FixtureError extends Error {
  constructor(path: string, problem: string) {
    super(`${path}: ${problem}`)
    this.name = "FixtureError"
  }
}

export type MarketFixture = {
  env: Env
  generatedAt: string
  note: string
  routes: Array<RouteAvailability>
  markets: Array<Market>
}

type Obj = Record<string, unknown>

function obj(value: unknown, path: string): Obj {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new FixtureError(path, "expected an object")
  return value as Obj
}

function arr(value: unknown, path: string): Array<unknown> {
  if (!Array.isArray(value)) throw new FixtureError(path, "expected an array")
  return value
}

function str(value: unknown, path: string): string {
  if (typeof value !== "string" || value === "") throw new FixtureError(path, "expected a string")
  return value
}

function bool(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new FixtureError(path, "expected a boolean")
  return value
}

function bps(value: unknown, path: string): number {
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 10_000)
    throw new FixtureError(path, "expected integer basis points 0-10000")
  return value as number
}

function oneOf<T extends string>(value: unknown, options: ReadonlyArray<T>, path: string): T {
  if (typeof value !== "string" || !options.includes(value as T))
    throw new FixtureError(path, `expected one of ${options.join(", ")}`)
  return value as T
}

function amount(value: unknown, path: string): bigint {
  if (typeof value !== "string" || !/^\d+$/.test(value))
    throw new FixtureError(path, "expected a non-negative integer string of raw token units")
  return BigInt(value)
}

function maybe<T>(value: unknown, path: string, read: (v: unknown, p: string) => T): T | null {
  return value === null ? null : read(value, path)
}

function address(value: unknown, path: string, bytes = 20): Address {
  const text = str(value, path)
  if (!new RegExp(`^0x[0-9a-fA-F]{${bytes * 2}}$`).test(text))
    throw new FixtureError(path, `expected a ${bytes}-byte hex value`)
  return text as Address
}

function isoTime(value: unknown, path: string): string {
  const text = str(value, path)
  if (Number.isNaN(Date.parse(text))) throw new FixtureError(path, "expected an ISO timestamp")
  return text
}

function rate(value: unknown, path: string): Rate {
  const o = obj(value, path)
  const percent = str(o.percent, `${path}.percent`)
  if (!/^\d+(\.\d+)?$/.test(percent)) throw new FixtureError(`${path}.percent`, "expected a decimal percent")
  return { basis: oneOf(o.basis, ["APY", "APR"] as const, `${path}.basis`), percent }
}

function cap(value: unknown, path: string): Cap {
  const o = obj(value, path)
  const kind = oneOf(o.kind, ["none", "limit"] as const, `${path}.kind`)
  return kind === "none" ? { kind } : { kind, amount: amount(o.amount, `${path}.amount`) }
}

const ACTIONS: ReadonlyArray<LendingAction> = [
  "lend",
  "withdraw",
  "post-collateral",
  "withdraw-collateral",
  "borrow",
  "repay",
]
const DATA_STATES: ReadonlyArray<DataState> = ["live", "partial", "unavailable"]

function token(ref: unknown, tokens: Map<string, Token>, chain: ExecutionChainId, path: string): Token {
  const id = str(ref, path)
  const found = tokens.get(id)
  if (!found) throw new FixtureError(path, `unknown token "${id}"`)
  if (found.chain !== chain) throw new FixtureError(path, `token "${id}" is not on ${chain}`)
  return found
}

function parseMarket(raw: unknown, path: string, tokens: Map<string, Token>, env: Env): Market {
  const o = obj(raw, path)
  const chain = oneOf(o.chain, EXECUTION_CHAIN_IDS, `${path}.chain`)
  const protocol = oneOf(o.protocol, PROTOCOL_IDS, `${path}.protocol`)
  const readAt = maybe(o.readAt, `${path}.readAt`, isoTime)
  const common = {
    env,
    name: str(o.name, `${path}.name`),
    readAt,
    dataState: oneOf(o.dataState, DATA_STATES, `${path}.dataState`),
    verified: bool(o.verified, `${path}.verified`),
    totalSupplied: maybe(o.totalSupplied, `${path}.totalSupplied`, amount),
    totalBorrowed: maybe(o.totalBorrowed, `${path}.totalBorrowed`, amount),
    availableLiquidity: maybe(o.availableLiquidity, `${path}.availableLiquidity`, amount),
  }

  if (protocol === "aave-v3") {
    const asset = token(o.asset, tokens, chain, `${path}.asset`)
    const ref = { protocol, chain, pool: address(o.pool, `${path}.pool`), asset: asset.address }
    const collateral = obj(o.collateral, `${path}.collateral`)
    const market: AaveReserve = {
      ...common,
      protocol,
      ref,
      key: marketKey(ref),
      asset,
      status: oneOf(o.status, ["active", "frozen", "paused"] as const, `${path}.status`),
      supplyRate: maybe(o.supplyRate, `${path}.supplyRate`, rate),
      borrowRate: maybe(o.borrowRate, `${path}.borrowRate`, rate),
      supplyCap: maybe(o.supplyCap, `${path}.supplyCap`, cap),
      borrowCap: maybe(o.borrowCap, `${path}.borrowCap`, cap),
      borrowable: bool(o.borrowable, `${path}.borrowable`),
      collateral: {
        enabled: bool(collateral.enabled, `${path}.collateral.enabled`),
        ltvBps: bps(collateral.ltvBps, `${path}.collateral.ltvBps`),
        liquidationThresholdBps: bps(collateral.liquidationThresholdBps, `${path}.collateral.liquidationThresholdBps`),
        liquidationBonusBps: bps(collateral.liquidationBonusBps, `${path}.collateral.liquidationBonusBps`),
      },
      restrictions: arr(o.restrictions, `${path}.restrictions`).map((r, i) => str(r, `${path}.restrictions[${i}]`)),
    }
    return market
  }

  if (protocol === "morpho-blue") {
    const ref = { protocol, chain, marketId: address(o.marketId, `${path}.marketId`, 32) }
    const loan = token(o.loanToken, tokens, chain, `${path}.loanToken`)
    const collateral = token(o.collateralToken, tokens, chain, `${path}.collateralToken`)
    if (loan.address === collateral.address)
      throw new FixtureError(path, "loan and collateral tokens must differ")
    const market: MorphoMarket = {
      ...common,
      protocol,
      ref,
      key: marketKey(ref),
      loanToken: loan,
      collateralToken: collateral,
      oracle: address(o.oracle, `${path}.oracle`),
      irm: address(o.irm, `${path}.irm`),
      lltvBps: bps(o.lltvBps, `${path}.lltvBps`),
      supplyRate: maybe(o.supplyRate, `${path}.supplyRate`, rate),
      borrowRate: maybe(o.borrowRate, `${path}.borrowRate`, rate),
      approved: bool(o.approved, `${path}.approved`),
      listedBy: oneOf(o.listedBy, ["registry", "discovery-api"] as const, `${path}.listedBy`),
    }
    return market
  }

  const ref = { protocol, chain, comet: address(o.comet, `${path}.comet`) }
  const base = token(o.baseToken, tokens, chain, `${path}.baseToken`)
  const collaterals = arr(o.collaterals, `${path}.collaterals`).map((entry, i): CometCollateral => {
    const p = `${path}.collaterals[${i}]`
    const c = obj(entry, p)
    if ("rate" in c || "supplyRate" in c)
      throw new FixtureError(p, "Compound III collateral earns no interest and must not carry a rate")
    const collateralToken = token(c.token, tokens, chain, `${p}.token`)
    if (collateralToken.address === base.address)
      throw new FixtureError(p, "the base asset cannot also be collateral")
    return {
      token: collateralToken,
      borrowCollateralFactorBps: bps(c.borrowCollateralFactorBps, `${p}.borrowCollateralFactorBps`),
      liquidateCollateralFactorBps: bps(c.liquidateCollateralFactorBps, `${p}.liquidateCollateralFactorBps`),
      liquidationFactorBps: bps(c.liquidationFactorBps, `${p}.liquidationFactorBps`),
      supplyCap: amount(c.supplyCap, `${p}.supplyCap`),
      totalSupplied: maybe(c.totalSupplied, `${p}.totalSupplied`, amount),
    }
  })
  const market: CompoundComet = {
    ...common,
    protocol,
    ref,
    key: marketKey(ref),
    baseToken: base,
    baseSupplyRate: maybe(o.baseSupplyRate, `${path}.baseSupplyRate`, rate),
    baseBorrowRate: maybe(o.baseBorrowRate, `${path}.baseBorrowRate`, rate),
    baseBorrowMin: amount(o.baseBorrowMin, `${path}.baseBorrowMin`),
    paused: arr(o.paused, `${path}.paused`).map((a, i) => oneOf(a, ACTIONS, `${path}.paused[${i}]`)),
    collaterals,
  }
  return market
}

export function parseMarketFixture(raw: unknown): MarketFixture {
  const root = obj(raw, "fixture")
  if (root.schema !== FIXTURE_SCHEMA) throw new FixtureError("fixture.schema", `expected "${FIXTURE_SCHEMA}"`)
  if (root.version !== FIXTURE_VERSION)
    throw new FixtureError("fixture.version", `unsupported version; this client reads "${FIXTURE_VERSION}"`)
  const env = oneOf(root.env, ["fixture", "testnet", "mainnet"] as const, "fixture.env")

  const tokens = new Map<string, Token>()
  for (const [id, entry] of Object.entries(obj(root.tokens, "fixture.tokens"))) {
    const p = `fixture.tokens.${id}`
    const t = obj(entry, p)
    const decimals = t.decimals
    if (!Number.isInteger(decimals) || (decimals as number) < 0 || (decimals as number) > 36)
      throw new FixtureError(`${p}.decimals`, "expected integer decimals 0-36")
    tokens.set(id, {
      chain: oneOf(t.chain, EXECUTION_CHAIN_IDS, `${p}.chain`),
      address: address(t.address, `${p}.address`),
      symbol: str(t.symbol, `${p}.symbol`),
      decimals: decimals as number,
    })
  }

  const routes = arr(root.routes, "fixture.routes").map((entry, i): RouteAvailability => {
    const p = `fixture.routes[${i}]`
    const r = obj(entry, p)
    const enabled = bool(r.enabled, `${p}.enabled`)
    const reason = maybe(r.reason, `${p}.reason`, str)
    if (!enabled && !reason) throw new FixtureError(`${p}.reason`, "a disabled route needs a reason")
    return {
      chain: oneOf(r.chain, EXECUTION_CHAIN_IDS, `${p}.chain`),
      protocol: oneOf(r.protocol, PROTOCOL_IDS, `${p}.protocol`),
      enabled,
      reason,
    }
  })

  const markets = arr(root.markets, "fixture.markets").map((m, i) =>
    parseMarket(m, `fixture.markets[${i}]`, tokens, env)
  )
  const seen = new Set<string>()
  for (const market of markets) {
    if (seen.has(market.key)) throw new FixtureError("fixture.markets", `duplicate market ${market.key}`)
    seen.add(market.key)
  }

  return {
    env,
    generatedAt: isoTime(root.generatedAt, "fixture.generatedAt"),
    note: str(root.note, "fixture.note"),
    routes,
    markets,
  }
}

export function findRoute(
  routes: Array<RouteAvailability>,
  chain: ExecutionChainId,
  protocol: ProtocolId
): RouteAvailability | undefined {
  return routes.find((r) => r.chain === chain && r.protocol === protocol)
}
