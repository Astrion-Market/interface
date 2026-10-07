import { formatUnits } from "../../lending/lib/amounts"
import type { Cap, Rate, Token } from "../model"

// Short table display plus the exact value for a tooltip. Null is unknown.
export function displayAmount(raw: bigint | null, token: Token, maxFractionDigits = 2) {
  if (raw === null) return { text: "Unknown", exact: "Not reported by the latest read" }
  return {
    text: `${formatUnits(raw, token.decimals, { maxFractionDigits }).text} ${token.symbol}`,
    exact: `${formatUnits(raw, token.decimals).text} ${token.symbol}`,
  }
}

export function displayRate(rate: Rate | null) {
  return rate === null ? "Not available" : `${rate.percent}% ${rate.basis}`
}

export function displayBps(bps: number) {
  return `${formatUnits(BigInt(bps), 2).text}%`
}

export function displayCap(cap: Cap | null, used: bigint | null, token: Token) {
  if (cap === null) return { text: "Unknown", reached: false }
  if (cap.kind === "none") return { text: "No cap", reached: false }
  const limit = displayAmount(cap.amount, token, 0).text
  if (used === null) return { text: `Limit ${limit}`, reached: false }
  const percent = cap.amount === 0n ? 100n : (used * 100n) / cap.amount
  return { text: `${percent}% of ${limit}`, reached: used >= cap.amount }
}

// Used only to order rows; never to build an amount.
export function rateSortValue(rate: Rate | null) {
  return rate === null ? null : Number(rate.percent)
}
