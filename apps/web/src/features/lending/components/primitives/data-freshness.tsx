import { StatusBadge } from "@workspace/ui/components/status-badge"

export type FreshnessState = "live" | "partial" | "unavailable"

function formatAge(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// Shows how old a reading is. Stale, partial, and missing data never look
// the same as fresh data, so a failed read cannot pass for a zero balance.
export function DataFreshness({
  updatedAt,
  state = "live",
  staleAfterMs = 5 * 60_000,
  source,
  now = Date.now(),
}: {
  updatedAt: Date | null
  state?: FreshnessState
  staleAfterMs?: number
  source?: string
  now?: number
}) {
  const time = updatedAt && (
    <time dateTime={updatedAt.toISOString()} title={updatedAt.toISOString()} suppressHydrationWarning>
      {formatAge(now - updatedAt.getTime())}
    </time>
  )
  const from = source ? ` from ${source}` : ""
  // A reading from the future means a clock or source error; never call it fresh.
  const future = updatedAt !== null && updatedAt.getTime() - now > 60_000

  if (state === "unavailable" || !updatedAt) {
    return (
      <StatusBadge tone="risk">
        Data unavailable{from}
        {time && <>, last read {time}</>}
      </StatusBadge>
    )
  }
  if (future) {
    return (
      <StatusBadge tone="attention">
        Timestamp ahead of your clock{from}
      </StatusBadge>
    )
  }
  if (state === "partial") {
    return (
      <StatusBadge tone="attention">
        Partial data{from}, updated {time}
      </StatusBadge>
    )
  }
  if (now - updatedAt.getTime() > staleAfterMs) {
    return (
      <StatusBadge tone="attention">
        Stale{from}, updated {time}
      </StatusBadge>
    )
  }
  return (
    <StatusBadge tone="neutral">
      Updated {time}
      {from}
    </StatusBadge>
  )
}
