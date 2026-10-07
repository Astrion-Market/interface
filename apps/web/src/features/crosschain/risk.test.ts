import assert from "node:assert/strict"
import { test } from "node:test"
import { parseMarketFixture } from "./fixture-client.ts"
import fixture from "./fixtures/markets.preview.json" with { type: "json" }
import { aaveHealth, compoundRisk, morphoRisk, previewBorrow } from "./risk.ts"
import type { AaveReserve, CompoundComet, MorphoMarket } from "./model"

const data = parseMarketFixture(fixture)
const find = <T,>(pred: (m: (typeof data.markets)[number]) => boolean) => data.markets.find(pred) as T
const aaveUsdc = find<AaveReserve>((m) => m.protocol === "aave-v3" && m.ref.chain === "base" && m.asset.symbol === "USDC")
const aaveWeth = find<AaveReserve>((m) => m.protocol === "aave-v3" && m.ref.chain === "base" && m.asset.symbol === "WETH")
const aaveCbeth = find<AaveReserve>((m) => m.protocol === "aave-v3" && m.asset.symbol === "cbETH")
const morpho86 = find<MorphoMarket>((m) => m.protocol === "morpho-blue" && m.lltvBps === 8600 && m.ref.chain === "base")
const comet = find<CompoundComet>((m) => m.protocol === "compound-v3" && m.ref.chain === "base")
const ONE_WETH = 10n ** 18n

test("Aave health factor uses liquidation thresholds and only enabled collateral", () => {
  const reading = aaveHealth(
    [
      { market: aaveWeth, supplied: ONE_WETH, debt: 0n, collateralEnabled: true },
      { market: aaveUsdc, supplied: 5_000_000_000n, debt: 1_000_000_000n, collateralEnabled: false },
    ],
    data.prices
  )
  // 2450.12 × 0.83 / 1000 = 2.03
  assert.equal(reading.metric?.value, "2.03")
  assert.equal(reading.level, "healthy")
})

test("unreadable balances make Aave risk unknown, not healthy", () => {
  const reading = aaveHealth([{ market: aaveUsdc, supplied: null, debt: 1n, collateralEnabled: true }], data.prices)
  assert.equal(reading.level, "unknown")
})

test("Morpho LTV is measured against the market's own LLTV", () => {
  // 0.8 cbETH = 2152.32 USD; 1650 debt = 76.6% LTV, 89% of 86% LLTV.
  const reading = morphoRisk(morpho86, 800_000_000_000_000_000n, 1_650_000_000n, data.prices)
  assert.equal(reading.level, "attention")
  assert.match(reading.metric?.value ?? "", /^76\.6% of 86% LLTV$/)
})

test("Compound supply has no liquidation risk; debt uses liquidation factors", () => {
  assert.equal(compoundRisk(comet, 5_000_000n, {}, data.prices).level, "healthy")
  const debt = compoundRisk(comet, -2_000_000_000n, { "base:0x4200000000000000000000000000000000000006": ONE_WETH }, data.prices)
  // 2000 / (2450.12 × 0.90) = 90.6%
  assert.equal(debt.level, "attention")
})

test("borrows beyond the collateral are blocked before signing", () => {
  const preview = previewBorrow(aaveUsdc, aaveWeth.asset, ONE_WETH, 3_000_000_000n, data.prices, aaveWeth)
  assert.ok(preview.blockers.some((b) => /more than the collateral supports/.test(b)))
  // 2450.12 × 0.80 = 1960.096 USDC max.
  assert.equal(preview.maxBorrow, 1_960_096_000n)
})

test("frozen or unsupported Aave collateral is blocked", () => {
  const preview = previewBorrow(aaveUsdc, aaveCbeth.asset, ONE_WETH, 100_000_000n, data.prices, aaveCbeth)
  assert.ok(preview.blockers.some((b) => /frozen/.test(b)))
})

test("Morpho rejects collateral the market doesn't take", () => {
  const preview = previewBorrow(morpho86, aaveWeth.asset, ONE_WETH, 100_000_000n, data.prices)
  assert.ok(preview.blockers.some((b) => /only accepts cbETH/.test(b)))
})

test("Compound enforces the minimum borrow and collateral supply caps", () => {
  const small = previewBorrow(comet, aaveWeth.asset, ONE_WETH, 500_000n, data.prices)
  assert.ok(small.blockers.some((b) => /at least 1 USDC/.test(b)))
  const cbeth = comet.collaterals.find((c) => c.token.symbol === "cbETH")!
  const capped = previewBorrow(comet, cbeth.token, ONE_WETH, 100_000_000n, data.prices)
  assert.ok(capped.blockers.some((b) => /supply cap would be exceeded/.test(b)))
})
