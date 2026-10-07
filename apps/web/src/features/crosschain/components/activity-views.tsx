import { Link } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { EmptyState } from "@workspace/ui/components/state-panel"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { StepTimeline } from "@workspace/ui/components/step-timeline"
import { formatUnits } from "../../lending/lib/amounts"
import { ROUTE_ENV } from "../env"
import { LEG_LABEL, operationStatus } from "../lifecycle"
import { explorerTxUrl } from "../networks"
import { useOperations } from "../operations-store"
import { ACTION_TEXT, diagnose, redactedDiagnostics, retryPlan } from "../recovery"
import type { StatusTone } from "@workspace/ui/components/status-badge"
import type { TimelineStep } from "@workspace/ui/components/step-timeline"
import type { OperationStatus } from "../lifecycle"
import type { TrackedLeg, TrackedOperation } from "../operations"

const STATE_TONE: Record<OperationStatus["state"], StatusTone> = {
  "in-progress": "pending",
  "needs-action": "risk",
  complete: "success",
}

const KIND_LABEL = { lend: "Lend", borrow: "Borrow", repay: "Repay", withdraw: "Withdraw" } as const

// What the user should know while a leg is outstanding.
function waitingNote(leg: TrackedLeg, op: TrackedOperation): string | undefined {
  // Only the step in progress gets a note; future steps say nothing yet.
  if (leg.status !== "submitted") return undefined
  switch (leg.kind) {
    case "source-transfer":
      return "Waiting for the Stellar transaction to confirm."
    case "attestation":
      return "Circle is attesting the transfer. This usually takes minutes; there's nothing to do."
    case "destination-mint":
      return leg.chain === "stellar" ? "USDC is being delivered to your Stellar account." : "USDC is arriving in your execution account."
    case "protocol-action":
      return op.kind === "lend" ? "Supplying to the market. Interest starts once this confirms." : "Running the lending action."
    case "return-transfer":
      return op.kind === "borrow" ? "Your debt is live and accruing while USDC is on its way to Stellar." : "Sending USDC back to Stellar."
  }
}

function amountText(op: TrackedOperation) {
  return `${formatUnits(op.amount, 6, { maxFractionDigits: 2 }).text} USDC`
}

export function ActivityList() {
  const { operations, hiddenCount, clearSimulations } = useOperations()
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-heading-page">Activity</h1>
          <p className="text-copy-sm mt-1 text-muted-foreground">
            Each cross-chain action and every leg of it, for the wallets connected now.
          </p>
        </div>
        {operations.some((o) => o.simulated) && (
          <Button variant="ghost" size="sm" onClick={clearSimulations}>
            Clear simulations
          </Button>
        )}
      </div>
      <p className="text-copy-sm rounded-lg bg-muted/60 px-3 py-2 text-muted-foreground">
        Status is cached on this device until the tracking service is connected, and is always rechecked against the
        chains before it can show success.
      </p>
      {hiddenCount > 0 && (
        <p className="text-copy-sm text-muted-foreground">
          {hiddenCount} operation{hiddenCount === 1 ? "" : "s"} from other wallet combinations {hiddenCount === 1 ? "is" : "are"} hidden.
        </p>
      )}
      {operations.length === 0 ? (
        <EmptyState
          title="No cross-chain activity for these wallets"
          description="This is not a complete transaction history: actions from other devices appear once the tracking service is connected."
          action={
            <Button variant="outline" nativeButton={false} render={<Link to="/markets" />}>
              Browse markets
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {operations.map((op) => {
            const status = operationStatus(op)
            return (
              <li key={op.id} className="relative flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40">
                <div className="min-w-0">
                  <Link
                    to="/activity/$operationId"
                    params={{ operationId: op.id }}
                    className="text-label after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none"
                  >
                    {KIND_LABEL[op.kind]} {amountText(op)}
                  </Link>
                  <p className="text-copy-sm text-muted-foreground">{new Date(op.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {op.simulated && <StatusBadge tone="attention">Simulated</StatusBadge>}
                  <StatusBadge tone={STATE_TONE[status.state]}>{status.label}</StatusBadge>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function downloadDiagnostics(op: TrackedOperation) {
  const blob = new Blob([JSON.stringify(redactedDiagnostics(op), null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `astrion-${op.id}-diagnostics.json`
  a.click()
  URL.revokeObjectURL(url)
}

function RecoveryPanel({ op }: { op: TrackedOperation }) {
  const guides = diagnose(op, Date.now())
  if (guides.length === 0) return null
  const retry = retryPlan(op)
  return (
    <section aria-label="Recovery" className="space-y-3">
      {guides.map((guide) => (
        <div key={guide.case} role="alert" className="space-y-2 rounded-lg border border-attention/40 bg-attention-surface p-4">
          <p className="text-label">{guide.title}</p>
          <p className="text-copy-sm text-foreground/80">{guide.explanation}</p>
          <ol className="space-y-1.5">
            {guide.actions.map((action, i) => (
              <li key={action} className="flex flex-wrap items-center gap-2">
                {action === "wait" ? (
                  <span className="text-copy-sm font-medium">{ACTION_TEXT[action]}</span>
                ) : (
                  <Button size="sm" variant={i === 0 ? "default" : "outline"} disabled>
                    {ACTION_TEXT[action]}
                  </Button>
                )}
                {i === 0 && <span className="text-label-xs text-muted-foreground">Recommended</span>}
              </li>
            ))}
          </ol>
          {guide.actions.includes("retry-action") && retry.length > 0 && (
            <p className="text-copy-sm text-muted-foreground">
              A retry resubmits only: {retry.map((i) => LEG_LABEL[op.legs[i].kind]).join(", ")}. Confirmed burns and lending
              actions are never repeated.
            </p>
          )}
          <p className="text-copy-sm text-muted-foreground">
            Actions that move funds open once execution accounts and the relayer are deployed. You can always act
            directly from the EVM wallet that owns your execution account.
          </p>
        </div>
      ))}
      <Button size="sm" variant="ghost" onClick={() => downloadDiagnostics(op)}>
        Download diagnostics (addresses shortened)
      </Button>
    </section>
  )
}

export function OperationDetail({ operationId }: { operationId: string }) {
  const { find, hiddenCount } = useOperations()
  const op = find(operationId)
  if (!op) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <EmptyState
          title="Operation not found for these wallets"
          description={
            hiddenCount > 0
              ? "It may belong to a different wallet combination. Reconnect the wallets that started it."
              : "It isn't cached on this device. Once the tracking service is connected, it will load from there."
          }
          action={
            <Button variant="outline" nativeButton={false} render={<Link to="/activity" />}>
              All activity
            </Button>
          }
        />
      </div>
    )
  }

  const status = operationStatus(op)
  const steps: Array<TimelineStep> = op.legs.map((leg, i) => {
    const note = waitingNote(leg, op)
    const link =
      leg.txHash && !op.simulated ? (
        <a
          href={explorerTxUrl(ROUTE_ENV, leg.chain, leg.txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-copy-sm text-primary underline-offset-2 hover:underline"
        >
          View transaction
        </a>
      ) : leg.txHash ? (
        <span className="text-copy-sm text-muted-foreground">Simulated transaction</span>
      ) : undefined
    return {
      id: `${op.id}-${i}`,
      label: `${LEG_LABEL[leg.kind]} · ${leg.chain === "stellar" ? "Stellar" : leg.chain === "base" ? "Base" : "Ethereum"}`,
      description: note,
      status: { waiting: "pending", submitted: "current", confirmed: "complete", failed: "failed", "not-needed": "skipped" }[leg.status] as TimelineStep["status"],
      detail: link,
    }
  })

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      <Link to="/activity" className="text-copy-sm text-primary underline-offset-2 hover:underline">
        ← All activity
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-heading-page">
            {KIND_LABEL[op.kind]} {amountText(op)}
          </h1>
          <p className="text-copy-sm mt-1 text-muted-foreground">Started {new Date(op.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {op.simulated && <StatusBadge tone="attention">Simulated: no funds moved</StatusBadge>}
          <StatusBadge tone={STATE_TONE[status.state]}>{status.label}</StatusBadge>
        </div>
      </div>

      <RecoveryPanel op={op} />

      <StepTimeline steps={steps} aria-label="Operation progress" />

      <p className="text-copy-sm text-muted-foreground">
        {op.source === "device-cache"
          ? "Cached on this device. A pending transaction alone is never reported as success."
          : "Status from the tracking service."}
      </p>
    </div>
  )
}
