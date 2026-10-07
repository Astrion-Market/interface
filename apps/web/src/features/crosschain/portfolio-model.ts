// Portfolio view model. Positions stay grouped by chain, protocol, and
// account; risk is never pooled; each balance is counted exactly once; and an
// unknown valuation is excluded from totals and counted, never treated as 0.

import { cometBaseBalance, priceKey } from "./positions.ts"
import { aaveHealth, compoundRisk, morphoRisk, usdE8 } from "./risk.ts"
import type { ExecutionChainId } from "../lending/lib/identity"
import type { AaveReserve, Market, Token } from "./model"
import type { Portfolio, PositionRead } from "./positions"
import type { Prices, RiskReading } from "./risk"

export type Holding = { token: Token; amount: bigint; usd: bigint | null }

export type PositionRow = {
  market: Market
  account: string | null
  readAt: string
  reconciled: boolean | null
  // Earning supply. Aave supply used as collateral stays here, flagged.
  supplied: Holding | null
  suppliedBacksBorrowing: boolean
  // Collateral that earns nothing (Morpho, Compound).
  collateral: Array<Holding>
  debt: Holding | null
  risk: RiskReading
  riskScope: "position" | "account"
}

export type Totals = {
  suppliedUsd: bigint
  collateralUsd: bigint
  debtUsd: bigint
  // Holdings left out of the totals because they couldn't be valued.
  unvalued: number
}

export type AttentionItem = { tone: "risk" | "attention"; message: string }

export type PortfolioView = {
  rows: Array<PositionRow>
  groups: Array<{ chain: ExecutionChainId; rows: Array<PositionRow> }>
  totals: Totals
  partial: boolean
  failedReads: Portfolio["failedReads"]
  attention: Array<AttentionItem>
}

function holding(token: Token, amount: bigint | null | undefined, prices: Prices): Holding | null {
  if (amount === null || amount === undefined || amount === 0n) return null
  return { token, amount, usd: usdE8(amount, token, prices) }
}

const STALE_MS = 15 * 60_000

export function buildPortfolioView(portfolio: Portfolio, markets: Array<Market>, prices: Prices, now: number): PortfolioView {
  const byKey = new Map(markets.map((m) => [m.key, m]))
  const reads = portfolio.positions.filter((p) => byKey.has(p.marketKey))

  // Aave health is per account on each chain.
  const aaveByChain = new Map<ExecutionChainId, Array<{ read: PositionRead; market: AaveReserve }>>()
  for (const read of reads) {
    const market = byKey.get(read.marketKey)!
    if (market.protocol !== "aave-v3") continue
    const list = aaveByChain.get(market.ref.chain) ?? []
    list.push({ read, market })
    aaveByChain.set(market.ref.chain, list)
  }
  const aaveRisk = new Map<ExecutionChainId, RiskReading>()
  for (const [chain, list] of aaveByChain)
    aaveRisk.set(
      chain,
      aaveHealth(
        list.map(({ read, market }) => ({
          market,
          supplied: read.supplied,
          debt: read.debt,
          collateralEnabled: read.collateralEnabled ?? false,
        })),
        prices
      )
    )

  const rows: Array<PositionRow> = reads.map((read) => {
    const market = byKey.get(read.marketKey)!
    const account = portfolio.accounts[market.ref.chain] ?? null
    const base = { market, account, readAt: read.readAt, reconciled: read.reconciled }
    if (market.protocol === "aave-v3") {
      return {
        ...base,
        supplied: holding(market.asset, read.supplied, prices),
        suppliedBacksBorrowing: (read.collateralEnabled ?? false) && market.collateral.enabled,
        collateral: [],
        debt: holding(market.asset, read.debt, prices),
        risk: aaveRisk.get(market.ref.chain) ?? { level: "unknown" },
        riskScope: "account",
      }
    }
    if (market.protocol === "morpho-blue") {
      return {
        ...base,
        supplied: holding(market.loanToken, read.supplied, prices),
        suppliedBacksBorrowing: false,
        collateral: [holding(market.collateralToken, read.collateral, prices)].filter((h): h is Holding => h !== null),
        debt: holding(market.loanToken, read.debt, prices),
        risk: morphoRisk(market, read.collateral ?? null, read.debt, prices),
        riskScope: "position",
      }
    }
    const balance = read.baseBalance === undefined || read.baseBalance === null ? null : cometBaseBalance(read.baseBalance)
    const collateral = market.collaterals
      .map((c) => holding(c.token, read.collaterals?.[priceKey(c.token.chain, c.token.address)], prices))
      .filter((h): h is Holding => h !== null)
    return {
      ...base,
      supplied: balance?.kind === "supplied" ? holding(market.baseToken, balance.amount, prices) : null,
      suppliedBacksBorrowing: false,
      collateral,
      debt: balance?.kind === "borrowed" ? holding(market.baseToken, balance.amount, prices) : null,
      risk: compoundRisk(market, read.baseBalance ?? null, read.collaterals, prices),
      riskScope: "position",
    }
  })

  const totals: Totals = { suppliedUsd: 0n, collateralUsd: 0n, debtUsd: 0n, unvalued: 0 }
  const add = (h: Holding | null, key: "suppliedUsd" | "collateralUsd" | "debtUsd") => {
    if (!h) return
    if (h.usd === null) totals.unvalued++
    else totals[key] += h.usd
  }
  for (const row of rows) {
    add(row.supplied, "suppliedUsd")
    row.collateral.forEach((h) => add(h, "collateralUsd"))
    add(row.debt, "debtUsd")
  }

  const attention: Array<AttentionItem> = []
  for (const r of portfolio.failedReads)
    attention.push({ tone: "risk", message: `Positions on ${r.protocol} (${r.chain}) couldn't be read: ${r.reason} Totals may be incomplete.` })
  const seenAccountRisk = new Set<string>()
  for (const row of rows) {
    const scopeKey = row.riskScope === "account" ? `${row.market.ref.chain}:${row.market.protocol}` : row.market.key
    if (seenAccountRisk.has(scopeKey)) continue
    seenAccountRisk.add(scopeKey)
    const where = row.riskScope === "account" ? `Your ${row.market.protocol === "aave-v3" ? "Aave" : row.market.protocol} account on ${row.market.ref.chain}` : row.market.name
    if (row.risk.level === "at-risk") attention.push({ tone: "risk", message: `${where} is close to liquidation.` })
    else if (row.risk.level === "attention") attention.push({ tone: "attention", message: `${where} needs attention: ${row.risk.metric?.label ?? "risk"} ${row.risk.metric?.value ?? ""}.` })
    else if (row.risk.level === "unknown") attention.push({ tone: "attention", message: `Risk for ${where} is unknown; treat it as at risk until it refreshes.` })
  }
  for (const row of rows) {
    if (row.reconciled === false) attention.push({ tone: "risk", message: `${row.market.name} doesn't match the protocol's own records. Don't act on it until it refreshes.` })
    if (now - Date.parse(row.readAt) > STALE_MS) attention.push({ tone: "attention", message: `${row.market.name} data is more than 15 minutes old.` })
  }

  const chains: Array<ExecutionChainId> = ["base", "ethereum"]
  return {
    rows,
    groups: chains.map((chain) => ({ chain, rows: rows.filter((r) => r.market.ref.chain === chain) })).filter((g) => g.rows.length > 0),
    totals,
    partial: portfolio.failedReads.length > 0 || reads.length < portfolio.positions.length,
    failedReads: portfolio.failedReads,
    attention,
  }
}
