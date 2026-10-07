import { StatusBadge } from "@workspace/ui/components/status-badge"
import type { StatusTone } from "@workspace/ui/components/status-badge"

export type RiskLevel = "healthy" | "attention" | "at-risk" | "unknown"

const LEVELS: Record<RiskLevel, { tone: StatusTone; label: string }> = {
  healthy: { tone: "success", label: "Healthy" },
  attention: { tone: "attention", label: "Needs attention" },
  "at-risk": { tone: "risk", label: "At risk of liquidation" },
  // Missing risk data is never shown as safe.
  unknown: { tone: "attention", label: "Risk unknown" },
}

export function RiskStatus({
  level,
  metric,
  reason,
}: {
  level: RiskLevel
  // Protocol-native measure, e.g. { label: "Health factor", value: "1.12" }.
  metric?: { label: string; value: string }
  reason?: React.ReactNode
}) {
  const { tone, label } = LEVELS[level]
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={tone}>{label}</StatusBadge>
        {metric && (
          <span className="text-copy-sm text-muted-foreground">
            {metric.label}{" "}
            <span className="font-mono-num font-medium text-foreground">
              {metric.value}
            </span>
          </span>
        )}
      </div>
      {reason && <p className="text-copy-sm text-muted-foreground">{reason}</p>}
    </div>
  )
}
