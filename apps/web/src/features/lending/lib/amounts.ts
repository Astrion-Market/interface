// Exact integer token-amount formatting. Never route raw amounts through
// Number: seven-decimal Stellar and six-decimal EVM balances must display
// exactly what will be signed.

type FormatUnitsOptions = {
  // Keep at least this many fraction digits (padding with zeros).
  minFractionDigits?: number
  // Show at most this many fraction digits. Extra digits are truncated toward
  // zero, never rounded up, and `truncated` reports that it happened.
  maxFractionDigits?: number
  group?: boolean
}

export type FormattedUnits = {
  text: string
  truncated: boolean
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function formatUnits(
  raw: bigint,
  decimals: number,
  {
    minFractionDigits = 0,
    maxFractionDigits = decimals,
    group = true,
  }: FormatUnitsOptions = {}
): FormattedUnits {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new RangeError(`Invalid token decimals: ${decimals}`)
  }
  const negative = raw < 0n
  const abs = negative ? -raw : raw
  const base = 10n ** BigInt(decimals)
  const whole = (abs / base).toString()
  const fullFraction = (abs % base).toString().padStart(decimals, "0")

  const shown = fullFraction.slice(0, Math.max(0, maxFractionDigits))
  const truncated = /[1-9]/.test(fullFraction.slice(shown.length))
  let fraction = shown.replace(/0+$/, "")
  if (fraction.length < minFractionDigits) {
    fraction = fraction.padEnd(Math.min(minFractionDigits, shown.length), "0")
  }

  const integer = group ? groupThousands(whole) : whole
  const text = `${negative ? "-" : ""}${integer}${fraction ? `.${fraction}` : ""}`
  return { text, truncated }
}

// Convert between decimal precisions, for example Stellar's seven-decimal
// USDC to the six-decimal CCTP message amount. `remainder` is the dust, in
// source units, that cannot be represented at the target precision.
export function convertDecimals(
  raw: bigint,
  fromDecimals: number,
  toDecimals: number
): { amount: bigint; remainder: bigint } {
  if (toDecimals >= fromDecimals) {
    return { amount: raw * 10n ** BigInt(toDecimals - fromDecimals), remainder: 0n }
  }
  const factor = 10n ** BigInt(fromDecimals - toDecimals)
  return { amount: raw / factor, remainder: raw % factor }
}

// Middle-truncate long identifiers such as Stellar accounts, contract IDs,
// EVM addresses, and Morpho market IDs.
export function shortenIdentifier(value: string, lead = 6, tail = 4): string {
  const prefix = value.startsWith("0x") ? 2 : 0
  if (value.length <= prefix + lead + tail + 1) return value
  return `${value.slice(0, prefix + lead)}…${value.slice(-tail)}`
}
