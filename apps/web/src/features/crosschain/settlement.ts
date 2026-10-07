// Repayment and withdrawal arithmetic. All integer units; rates only ever
// size a buffer and are rounded up so the buffer errs toward covering debt.

import type { Rate } from "./model"

const SECONDS_PER_YEAR = 31_536_000n

// Interest that can accrue on `debt` over `seconds` at `rate`, rounded up.
export function accrualBuffer(debt: bigint, rate: Rate | null, seconds: number): bigint | null {
  if (rate === null) return null
  const match = /^(\d+)(?:\.(\d{1,6}))?\d*$/.exec(rate.percent)
  if (!match) return null
  // Percent with 6 decimals of precision: 4.12% -> 4_120_000.
  const ppm = BigInt(match[1]) * 1_000_000n + BigInt((match.at(2) ?? "").padEnd(6, "0"))
  const numerator = debt * ppm * BigInt(seconds)
  const denominator = 100n * 1_000_000n * SECONDS_PER_YEAR
  return (numerator + denominator - 1n) / denominator
}

export type FullRepayPlan = {
  debtAtQuote: bigint
  buffer: bigint
  // What to send so the debt is still covered after the transfer delay.
  send: bigint
}

// Full repayment from Stellar: interest keeps accruing while USDC is in
// transit, so send the current debt plus a buffer for the expected delay.
export function planFullRepay(debt: bigint, rate: Rate | null, transitSeconds: number): FullRepayPlan | null {
  const buffer = accrualBuffer(debt, rate, transitSeconds)
  if (buffer === null) return null
  // At least one minimal unit so a zero-rate quote still survives rounding.
  const padded = buffer === 0n && debt > 0n ? 1n : buffer
  return { debtAtQuote: debt, buffer: padded, send: debt + padded }
}

export type RepayOutcome =
  | { kind: "fully-repaid"; repaid: bigint; residual: bigint }
  | { kind: "top-up-needed"; repaid: bigint; remainingDebt: bigint; residual: 0n }

// Settle a repayment against the debt observed at execution. "Fully repaid"
// only when the remaining debt is confirmed zero; any leftover USDC is
// reported, not silently swept.
export function settleRepay(delivered: bigint, debtAtExecution: bigint): RepayOutcome {
  if (delivered >= debtAtExecution)
    return { kind: "fully-repaid", repaid: debtAtExecution, residual: delivered - debtAtExecution }
  return { kind: "top-up-needed", repaid: delivered, remainingDebt: debtAtExecution - delivered, residual: 0n }
}

export type WithdrawLimit = {
  max: bigint | null
  // Why the maximum is lower than the user's balance, if it is.
  limitedBy: "balance" | "liquidity" | "unknown"
}

// Most that can be withdrawn now: the user's supply, capped by market liquidity.
export function withdrawLimit(supplied: bigint | null, liquidity: bigint | null): WithdrawLimit {
  if (supplied === null) return { max: null, limitedBy: "unknown" }
  if (liquidity === null) return { max: null, limitedBy: "unknown" }
  return liquidity < supplied ? { max: liquidity, limitedBy: "liquidity" } : { max: supplied, limitedBy: "balance" }
}
