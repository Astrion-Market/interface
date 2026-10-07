import assert from "node:assert/strict"
import { test } from "node:test"
import { EXECUTION_CHAIN_IDS, PROTOCOL_IDS } from "../lending/lib/identity.ts"
import { FixtureError, findRoute, parseMarketFixture } from "./fixture-client.ts"
import fixture from "./fixtures/markets.preview.json" with { type: "json" }
import { operationStatus, operationTimeline } from "./lifecycle.ts"
import { actionAvailability, lendRate, marketKey } from "./model.ts"
import { cometBaseBalance } from "./positions.ts"
import { crosschainQueryKeys } from "./query-keys.ts"
import type { Operation } from "./lifecycle"

const parsed = parseMarketFixture(fixture)
const clone = () => structuredClone(fixture) as unknown as Record<string, any>

test("preview fixture matches the client schema", () => {
  assert.equal(parsed.env, "fixture")
  assert.ok(parsed.markets.length > 0)
  assert.ok(parsed.markets.every((m) => !m.verified), "fixtures are never verified deployments")
})

test("all six chain/protocol routes are declared with reasons when disabled", () => {
  for (const chain of EXECUTION_CHAIN_IDS)
    for (const protocol of PROTOCOL_IDS) {
      const route = findRoute(parsed.routes, chain, protocol)
      assert.ok(route, `${chain}/${protocol} missing`)
      if (!route.enabled) assert.ok(route.reason)
    }
})

test("amounts reject numbers so floats never become token units", () => {
  const bad = clone()
  bad.markets[0].totalSupplied = 412345678.123456
  assert.throws(() => parseMarketFixture(bad), FixtureError)
})

test("unknown schema versions fail loudly", () => {
  const bad = clone()
  bad.version = "1"
  assert.throws(() => parseMarketFixture(bad), /unsupported version/)
})

test("Compound collateral cannot carry a supply rate", () => {
  const bad = clone()
  const comet = bad.markets.find((m: any) => m.protocol === "compound-v3")
  comet.collaterals[0].supplyRate = { basis: "APR", percent: "1" }
  assert.throws(() => parseMarketFixture(bad), /earns no interest/)
})

test("Morpho markets with the same symbols get distinct keys", () => {
  const cbethUsdc = parsed.markets.filter(
    (m) => m.protocol === "morpho-blue" && m.collateralToken.symbol === "cbETH" && m.loanToken.symbol === "USDC"
  )
  assert.equal(cbethUsdc.length, 2)
  assert.notEqual(cbethUsdc[0].key, cbethUsdc[1].key)
})

test("market keys are case-insensitive and chain-scoped", () => {
  const ref = { protocol: "compound-v3", chain: "base", comet: "0xB125E6687D4313864E53DF431D5425969C15EB2F" } as const
  assert.equal(marketKey(ref), marketKey({ ...ref, comet: "0xb125e6687d4313864e53df431d5425969c15eb2f" }))
  assert.notEqual(marketKey(ref), marketKey({ ...ref, chain: "ethereum" }))
})

test("unknown readings stay null, distinct from a zero rate", () => {
  const unavailable = parsed.markets.find((m) => m.dataState === "unavailable")
  assert.ok(unavailable)
  assert.equal(unavailable.availableLiquidity, null)
  assert.equal(lendRate(unavailable), null)
  const zero = parsed.markets.find((m) => lendRate(m)?.percent === "0")
  assert.ok(zero, "fixture includes a real zero rate")
})

test("disabled routes and protocol states block actions with reasons", () => {
  for (const market of parsed.markets) {
    const route = findRoute(parsed.routes, market.ref.chain, market.protocol)
    for (const a of actionAvailability(market, route)) {
      assert.equal(a.available, false)
      assert.ok(a.reasons.length > 0)
    }
  }
})

test("frozen Aave reserves block lend and borrow but not withdraw", () => {
  const frozen = parsed.markets.find((m) => m.protocol === "aave-v3" && m.status === "frozen")
  assert.ok(frozen)
  const enabledRoute = { chain: frozen.ref.chain, protocol: frozen.protocol, enabled: true, reason: null }
  const verified = { ...frozen, verified: true }
  const byAction = Object.fromEntries(actionAvailability(verified, enabledRoute).map((a) => [a.action, a]))
  assert.equal(byAction.lend.available, false)
  assert.equal(byAction.withdraw.available, true)
})

test("an unapproved Morpho market is never actionable", () => {
  const listed = parsed.markets.find((m) => m.protocol === "morpho-blue" && !m.approved)
  assert.ok(listed)
  const enabledRoute = { chain: listed.ref.chain, protocol: listed.protocol, enabled: true, reason: null }
  const result = actionAvailability({ ...listed, verified: true }, enabledRoute)
  assert.ok(result.every((a) => !a.available && a.reasons.some((r) => r.includes("approved"))))
})

test("Compound base balance is either supplied or borrowed", () => {
  assert.deepEqual(cometBaseBalance(5_000_000n), { kind: "supplied", amount: 5_000_000n })
  assert.deepEqual(cometBaseBalance(-2_500_000n), { kind: "borrowed", amount: 2_500_000n })
  assert.deepEqual(cometBaseBalance(0n), { kind: "none" })
})

test("account query keys separate wallets and networks", () => {
  const a = crosschainQueryKeys.account("testnet", { stellar: "GA", evm: "0xAbC" })
  const b = crosschainQueryKeys.account("testnet", { stellar: "GB", evm: "0xabc" })
  const c = crosschainQueryKeys.account("mainnet", { stellar: "GA", evm: "0xabc" })
  assert.notDeepEqual(a, b)
  assert.notDeepEqual(a, c)
  assert.deepEqual(a, crosschainQueryKeys.account("testnet", { stellar: "GA", evm: "0xabc" }))
})

test("borrow with pending payout reports live debt, not completion", () => {
  const op: Operation = {
    id: "op-1",
    kind: "borrow",
    legs: [
      { kind: "protocol-action", chain: "base", status: "confirmed", txHash: "0x1" },
      { kind: "return-transfer", chain: "base", status: "submitted", txHash: "0x2" },
      { kind: "destination-mint", chain: "stellar", status: "waiting", txHash: null },
    ],
  }
  assert.deepEqual(operationStatus(op), {
    state: "in-progress",
    label: "Borrow opened; transfer to Stellar pending",
  })
  assert.deepEqual(
    operationTimeline(op).map((s) => s.status),
    ["complete", "current", "pending"]
  )
})

test("a source confirmation alone never completes a lend", () => {
  const op: Operation = {
    id: "op-2",
    kind: "lend",
    legs: [
      { kind: "source-transfer", chain: "stellar", status: "confirmed", txHash: "abc" },
      { kind: "attestation", chain: "stellar", status: "waiting", txHash: null },
      { kind: "protocol-action", chain: "base", status: "waiting", txHash: null },
    ],
  }
  assert.equal(operationStatus(op).state, "in-progress")
})
