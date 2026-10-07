import assert from "node:assert/strict"
import { test } from "node:test"
import { accrualBuffer, planFullRepay, settleRepay, withdrawLimit } from "./settlement.ts"

const APR = { basis: "APR" as const, percent: "5.40" }

test("transit buffer rounds up and scales with time", () => {
  // 1,000 USDC at 5.40% for 30 minutes = 0.003082... USDC -> 3,083 units.
  assert.equal(accrualBuffer(1_000_000_000n, APR, 1800), 3_083n)
  assert.equal(accrualBuffer(1_000_000_000n, null, 1800), null)
})

test("a full repay sends debt plus the buffer", () => {
  assert.deepEqual(planFullRepay(1_000_000_000n, APR, 1800), {
    debtAtQuote: 1_000_000_000n,
    buffer: 3_083n,
    send: 1_000_003_083n,
  })
  // Unknown rate means no safe full-repay amount.
  assert.equal(planFullRepay(1_000_000_000n, null, 1800), null)
  // A zero rate still pads by one unit.
  assert.equal(planFullRepay(5n, { basis: "APY", percent: "0" }, 1800)?.send, 6n)
})

test("fully repaid only when remaining debt is zero; leftovers are reported", () => {
  assert.deepEqual(settleRepay(1_000_003_083n, 1_000_002_000n), {
    kind: "fully-repaid",
    repaid: 1_000_002_000n,
    residual: 1_083n,
  })
})

test("interest beyond the buffer asks for a top-up and keeps the debt visible", () => {
  const outcome = settleRepay(1_000_003_083n, 1_000_010_000n)
  assert.equal(outcome.kind, "top-up-needed")
  assert.equal(outcome.kind === "top-up-needed" && outcome.remainingDebt, 6_917n)
})

test("withdrawals are capped by market liquidity, and unknown is not zero", () => {
  assert.deepEqual(withdrawLimit(500n, 1_000n), { max: 500n, limitedBy: "balance" })
  assert.deepEqual(withdrawLimit(500n, 200n), { max: 200n, limitedBy: "liquidity" })
  assert.deepEqual(withdrawLimit(500n, null), { max: null, limitedBy: "unknown" })
})
