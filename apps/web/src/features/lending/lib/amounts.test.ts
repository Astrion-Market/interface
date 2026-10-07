import assert from "node:assert/strict"
import { test } from "node:test"
import { convertDecimals, formatUnits, parseUnits, shortenIdentifier } from "./amounts.ts"

test("formats seven-decimal Stellar amounts exactly", () => {
  assert.equal(formatUnits(12_345_678_901_234_567n, 7).text, "1,234,567,890.1234567")
  assert.equal(formatUnits(1n, 7).text, "0.0000001")
  assert.equal(formatUnits(0n, 7).text, "0")
})

test("formats six-decimal EVM amounts and pads to a minimum", () => {
  assert.equal(formatUnits(2_500_000n, 6, { minFractionDigits: 2 }).text, "2.50")
  assert.equal(formatUnits(1_000_000_000_000n, 6, { group: false }).text, "1000000")
})

test("truncates toward zero and reports hidden digits", () => {
  assert.deepEqual(formatUnits(1_999_999n, 6, { maxFractionDigits: 2 }), {
    text: "1.99",
    truncated: true,
  })
  assert.deepEqual(formatUnits(1_990_000n, 6, { maxFractionDigits: 2 }), {
    text: "1.99",
    truncated: false,
  })
})

test("keeps the sign of negative amounts", () => {
  assert.equal(formatUnits(-1_234_500n, 6).text, "-1.2345")
})

test("rejects invalid decimals", () => {
  assert.throws(() => formatUnits(1n, -1), RangeError)
})

test("converts seven to six decimals and keeps the dust", () => {
  assert.deepEqual(convertDecimals(1_234_567n, 7, 6), {
    amount: 123_456n,
    remainder: 7n,
  })
  assert.deepEqual(convertDecimals(123_456n, 6, 7), {
    amount: 1_234_560n,
    remainder: 0n,
  })
})

test("middle-truncates long identifiers", () => {
  assert.equal(
    shortenIdentifier("GAMDADDXO4XLCLIDP5ZCQRRWTP2PCA7LB2JLKWM7DSWN6WRNTXAVBPYQ"),
    "GAMDAD…BPYQ"
  )
  assert.equal(
    shortenIdentifier("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),
    "0x833589…2913"
  )
  assert.equal(shortenIdentifier("short"), "short")
})

test("parses decimal input exactly", () => {
  assert.equal(parseUnits("1,250.1234567", 7), 12_501_234_567n)
  assert.equal(parseUnits("0.000001", 6), 1n)
  assert.equal(parseUnits(".5", 6), 500_000n)
  assert.equal(parseUnits("7", 6), 7_000_000n)
})

test("rejects malformed or over-precise input", () => {
  assert.equal(parseUnits("1.0000001", 6), null)
  assert.equal(parseUnits("-1", 6), null)
  assert.equal(parseUnits("1e6", 6), null)
  assert.equal(parseUnits("", 6), null)
  assert.equal(parseUnits(".", 6), null)
})
