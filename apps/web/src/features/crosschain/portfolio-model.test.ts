import assert from "node:assert/strict"
import { test } from "node:test"
import { parseMarketFixture } from "./fixture-client.ts"
import fixture from "./fixtures/markets.preview.json" with { type: "json" }
import { buildPortfolioView } from "./portfolio-model.ts"

const data = parseMarketFixture(fixture)
const NOW = Date.parse("2026-10-06T12:00:00Z")
const view = buildPortfolioView(data.samplePortfolio, data.markets, data.prices, NOW)

test("a failed read makes the portfolio partial, not empty or healthy", () => {
  assert.equal(view.partial, true)
  assert.ok(view.attention.some((a) => a.tone === "risk" && /couldn't be read/.test(a.message)))
  assert.ok(view.rows.length > 0)
})

test("Aave collateral is counted once, as supply", () => {
  const weth = view.rows.find((r) => r.market.protocol === "aave-v3" && r.supplied?.token.symbol === "WETH")!
  assert.equal(weth.suppliedBacksBorrowing, true)
  assert.equal(weth.collateral.length, 0)
  // Supplied: 2500 USDC + 1.2 WETH × 2450.12 + 500 USDC (Morpho lend) = 5940.144
  assert.equal(view.totals.suppliedUsd, 594_014_400_000n)
})

test("Morpho and Compound collateral is separate and earns nothing", () => {
  // 0.8 cbETH × 2690.40 + 0.5 WETH × 2450.12 = 3377.38
  assert.equal(view.totals.collateralUsd, 337_738_000_000n)
})

test("Compound net base debt shows as debt, not as negative supply", () => {
  const comet = view.rows.find((r) => r.market.protocol === "compound-v3")!
  assert.equal(comet.supplied, null)
  assert.equal(comet.debt?.amount, 300_000_000n)
})

test("Aave risk is one account reading per chain; others are per position", () => {
  const aave = view.rows.filter((r) => r.market.protocol === "aave-v3")
  assert.ok(aave.every((r) => r.riskScope === "account" && r.risk.metric?.value === aave[0].risk.metric?.value))
  const morpho = view.rows.find((r) => r.market.protocol === "morpho-blue")!
  assert.equal(morpho.riskScope, "position")
  assert.equal(morpho.risk.level, "attention")
})

test("unvalued holdings are excluded and counted, never zero", () => {
  const noPrices = buildPortfolioView(data.samplePortfolio, data.markets, new Map(), NOW)
  assert.equal(noPrices.totals.suppliedUsd, 0n)
  assert.ok(noPrices.totals.unvalued > 0)
  assert.ok(noPrices.rows.every((r) => r.risk.level === "unknown"))
})
