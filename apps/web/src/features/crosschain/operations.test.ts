import assert from "node:assert/strict"
import { test } from "node:test"
import { parseMarketFixture } from "./fixture-client.ts"
import fixture from "./fixtures/markets.preview.json" with { type: "json" }
import { operationStatus } from "./lifecycle.ts"
import {
  applyLegUpdate,
  deserializeOperations,
  legsFor,
  registerOperation,
  serializeOperations,
} from "./operations.ts"
import { MAX_FEE_BPS, buildQuote, validateQuote } from "./quote.ts"
import type { TrackedOperation } from "./operations"
import type { QuoteRequest } from "./quote"

function lendOp(): TrackedOperation {
  return {
    id: "op-1",
    kind: "lend",
    intentId: "intent-1",
    ownerKey: "G|0xa",
    marketKey: "base:aave-v3:0x1",
    amount: 100_000_000n,
    createdAt: "2026-10-07T00:00:00Z",
    simulated: true,
    source: "device-cache",
    legs: legsFor("lend", "base").map((l) => ({ ...l, status: "waiting", txHash: null, sequence: 0, updatedAt: null })),
  }
}

const update = (legIndex: number, status: TrackedOperation["legs"][number]["status"], sequence: number) => ({
  operationId: "op-1",
  legIndex,
  status,
  sequence,
  observedAt: "2026-10-07T00:00:01Z",
})

test("duplicate updates are ignored", () => {
  const once = applyLegUpdate(lendOp(), update(0, "confirmed", 1))
  assert.equal(applyLegUpdate(once, update(0, "confirmed", 1)), once)
})

test("out-of-order updates never move a leg backwards", () => {
  const confirmed = applyLegUpdate(lendOp(), update(0, "confirmed", 2))
  const late = applyLegUpdate(confirmed, update(0, "submitted", 3))
  assert.equal(late.legs[0].status, "confirmed")
})

test("a failed leg can recover only through confirmation", () => {
  const failed = applyLegUpdate(lendOp(), update(3, "failed", 1))
  assert.equal(applyLegUpdate(failed, update(3, "submitted", 2)).legs[3].status, "failed")
  assert.equal(applyLegUpdate(failed, update(3, "confirmed", 3)).legs[3].status, "confirmed")
})

test("the same intent cannot be registered twice", () => {
  const first = registerOperation([], lendOp())
  const second = registerOperation(first.ops, { ...lendOp(), id: "op-2" })
  assert.equal(second.duplicate, true)
  assert.equal(second.ops.length, 1)
})

test("a pending source hash alone never reads as success", () => {
  const op = applyLegUpdate(lendOp(), { ...update(0, "submitted", 1), txHash: "abc" })
  assert.equal(operationStatus(op).state, "in-progress")
})

test("mint confirmed but supply failed means funds are on Base", () => {
  let op = lendOp()
  op = applyLegUpdate(op, update(0, "confirmed", 1))
  op = applyLegUpdate(op, update(1, "confirmed", 1))
  op = applyLegUpdate(op, update(2, "confirmed", 1))
  op = applyLegUpdate(op, update(3, "failed", 1))
  assert.deepEqual(operationStatus(op), { state: "needs-action", label: "Funds available on Base" })
})

test("device cache round-trips bigint amounts", () => {
  const [restored] = deserializeOperations(serializeOperations([lendOp()]))
  assert.equal(restored.amount, 100_000_000n)
})

const data = parseMarketFixture(fixture)
const market = data.markets[0]
const request = (overrides: Partial<QuoteRequest> = {}): QuoteRequest => ({
  env: "fixture",
  marketKey: market.key,
  action: "lend",
  amount: 1_000_000_000n,
  recipient: null,
  owner: { stellar: "GA", evm: "0xa" },
  collateral: null,
  ...overrides,
})

test("a quote needs no wallet and lists signatures in order", () => {
  const quote = buildQuote(request(), market, data.fees, 0)
  assert.deepEqual(
    quote.signatures.map((s) => s.wallet),
    ["stellar", "evm"]
  )
  assert.deepEqual(validateQuote(quote, request(), 1_000), [])
})

test("changing amount or recipient invalidates the quote", () => {
  const quote = buildQuote(request(), market, data.fees, 0)
  assert.equal(validateQuote(quote, request({ amount: 1n + 1_000_000_000n }), 1)[0]?.kind, "changed")
  const borrow = request({ action: "borrow", recipient: "GA" })
  const borrowQuote = buildQuote(borrow, market, data.fees, 0)
  assert.equal(validateQuote(borrowQuote, { ...borrow, recipient: "GB" }, 1)[0]?.kind, "changed")
})

test("stale quotes and excessive fees are blocked", () => {
  const quote = buildQuote(request(), market, data.fees, 0)
  assert.ok(validateQuote(quote, request(), quote.expiresAt).some((i) => i.kind === "expired"))
  // 1 USDC pays the 0.05 USDC minimum bridge fee: 5%, over the 1% limit.
  const tiny = request({ amount: 1_000_000n })
  assert.ok(MAX_FEE_BPS === 100n)
  assert.ok(validateQuote(buildQuote(tiny, market, data.fees, 0), tiny, 1).some((i) => i.kind === "fee-too-high"))
})
