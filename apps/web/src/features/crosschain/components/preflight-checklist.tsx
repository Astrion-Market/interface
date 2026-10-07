import { StatusBadge } from "@workspace/ui/components/status-badge"
import type { StatusTone } from "@workspace/ui/components/status-badge"
import type { CheckStatus, PreflightCheck } from "../preflight"

const TONE: Record<CheckStatus, { tone: StatusTone; text: string }> = {
  pass: { tone: "success", text: "Ready" },
  fail: { tone: "risk", text: "Fix needed" },
  unknown: { tone: "attention", text: "Can't check" },
  "not-needed": { tone: "neutral", text: "Not needed" },
}

export function PreflightChecklist({ checks }: { checks: Array<PreflightCheck> }) {
  const visible = checks.filter((c) => c.status !== "not-needed")
  return (
    <ul aria-label="Route checks" className="divide-y divide-border rounded-lg border border-border">
      {visible.map((check) => (
        <li key={check.id} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-label">{check.label}</p>
            {check.detail && <p className="text-copy-sm text-muted-foreground">{check.detail}</p>}
            {check.status !== "pass" && check.remediation && (
              <p className="text-copy-sm text-foreground">{check.remediation}</p>
            )}
          </div>
          <StatusBadge tone={TONE[check.status].tone} className="shrink-0">
            {TONE[check.status].text}
          </StatusBadge>
        </li>
      ))}
    </ul>
  )
}
