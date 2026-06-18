export const WAD = 1_000_000_000_000_000_000n

export function wadToNumber(
  value: bigint | number | string | null | undefined
): number {
  if (value == null) return 0
  const bigintValue = BigInt(value)
  return Number(bigintValue) / Number(WAD)
}

export function wadToPercent(
  value: bigint | number | string | null | undefined
): number {
  return wadToNumber(value) * 100
}

export function tokenAmountToNumber(
  raw: bigint | number | string | null | undefined,
  decimals: number
): number {
  if (raw == null) return 0
  return Number(BigInt(raw)) / 10 ** decimals
}

export function formatCompactUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: value >= 1_000 ? 2 : 4,
  }).format(value)
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompactToken(value: number, symbol: string): string {
  return `${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1_000 ? 2 : 4,
  }).format(value)} ${symbol}`
}

export function formatTokenAmount(
  raw: bigint | number | string | null | undefined,
  decimals: number,
  symbol: string
): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
  }).format(tokenAmountToNumber(raw, decimals))} ${symbol}`
}

export function formatOracleUpdated(
  timestamp: bigint | number | string | null | undefined
): string {
  if (timestamp == null) return "No price"

  const seconds = Number(timestamp)
  if (!Number.isFinite(seconds) || seconds <= 0) return "No price"

  const diffMs = Date.now() - seconds * 1000
  if (diffMs < 60_000) return "Just now"
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(seconds * 1000))
}
