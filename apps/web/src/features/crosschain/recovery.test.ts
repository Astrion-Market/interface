import assert from "node:assert/strict"
import { test } from "node:test"
import { operationStatus } from "./lifecycle.ts"
import { legsFor } from "./operations.ts"
import { diagnose, redactedDiagnostics, retryPlan } from "./recovery.ts"
import type { LegStatus } from "./lifecycle"
import type { FailureReason, TrackedOperation } from "./operations"

function op(kind: TrackedOperation["kind"], statuses: Array<LegStatus>, reasons: Array<FailureReason | undefined> = []): TrackedOperation {
  return {
    id: "op",
    kind,
    intentId: "i",
    ownerKey: "GAMDADDXO4XLCLIDP5ZCQRRWTP2PCA7LB2JLKWM7DSWN6WRNTXAVBPYQ|0xabcdef0000000000000000000000000000001234",
    marketKey: "base:aave-v3:0x1",
    amount: 1n,
    createdAt: "2026-10-07T00:00:00Z",
    simulated: false,
    source: "device-cache",
    legs: legsFor(kind, "base").map((leg, i) => ({
      ...leg,
      status: statuses[i],
      reason: reasons[i],
      txHash: statuses[i] === "waiting" ? null : `0x${i}`,
      sequence: 1,
      updatedAt: "2026-10-07T00:00:00Z",
    })),
  }
}

const NOW = Date.parse("2026-10-07T00:05:00Z")
const cases = (o: TrackedOperation, now = NOW) => diagnose(o, now).map((g) => g.case)

test("a failed supply after delivery offers retry, return, and withdraw", () => {
  const o = op("lend", ["confirmed", "confirmed", "confirmed", "failed"])
  const [guide] = diagnose(o, NOW)
  assert.equal(guide.case, "action-failed")
  assert.deepEqual(guide.actions, ["retry-action", "return-to-stellar", "withdraw-to-evm"])
})

test("each failure reason maps to its own guide", () => {
  assert.deepEqual(cases(op("lend", ["confirmed", "confirmed", "confirmed", "failed"], [, , , "intent-expired"])), ["intent-expired"])
  assert.deepEqual(cases(op("lend", ["confirmed", "confirmed", "confirmed", "failed"], [, , , "protocol-paused"])), ["protocol-paused"])
  assert.deepEqual(cases(op("lend", ["confirmed", "confirmed", "failed", "waiting"], [, , "insufficient-gas"])), ["insufficient-gas"])
  assert.deepEqual(cases(op("borrow", ["confirmed", "confirmed", "confirmed", "failed"], [, , , "trustline-missing"])), ["trustline-missing"])
  assert.deepEqual(cases(op("borrow", ["confirmed", "confirmed", "confirmed", "failed"], [, , , "relayer-outage"])), ["relayer-outage"])
  assert.deepEqual(cases(op("lend", ["confirmed", "confirmed", "failed", "waiting"], [, , "already-minted"])), ["already-minted"])
})

test("a withdrawal whose return transfer failed is recoverable and labeled separately", () => {
  const o = op("withdraw", ["confirmed", "failed", "waiting", "waiting"])
  assert.deepEqual(cases(o), ["return-not-sent"])
  assert.equal(operationStatus(o).state, "needs-action")
})

test("a long-outstanding attestation is flagged as delayed, not failed", () => {
  const o = op("lend", ["confirmed", "submitted", "waiting", "waiting"])
  assert.deepEqual(cases(o), [])
  assert.deepEqual(cases(o, Date.parse("2026-10-07T01:00:00Z")), ["delayed-attestation"])
})

test("retries never repeat a confirmed burn or lending action", () => {
  assert.deepEqual(retryPlan(op("lend", ["confirmed", "confirmed", "confirmed", "failed"])), [3])
  // Borrow confirmed, return burn failed: only the return can be retried.
  assert.deepEqual(retryPlan(op("borrow", ["confirmed", "failed", "waiting", "waiting"])), [1, 2, 3])
  // Return burn confirmed: nothing up to and including it is retried.
  assert.deepEqual(retryPlan(op("borrow", ["confirmed", "confirmed", "waiting", "waiting"])), [2, 3])
})

test("diagnostics shorten identities", () => {
  const d = redactedDiagnostics(op("lend", ["confirmed", "waiting", "waiting", "waiting"]))
  assert.equal(d.owner, "GAMD…BPYQ|0xabcd…1234")
  assert.ok(!JSON.stringify(d).includes("GAMDADDXO4XLCLIDP5ZCQRRWTP2PCA7LB2JLKWM7DSWN6WRNTXAVBPYQ"))
})
