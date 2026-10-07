import { StatusIcon } from "@workspace/ui/components/status-badge"
import { cn } from "@workspace/ui/lib/utils"

import type { StatusTone } from "@workspace/ui/components/status-badge"

type StepStatus = "complete" | "current" | "pending" | "failed" | "skipped"

type TimelineStep = {
  id: string
  label: React.ReactNode
  description?: React.ReactNode
  status: StepStatus
  // Extra content such as a transaction link or the wallet that must sign.
  detail?: React.ReactNode
}

const STATUS: Record<StepStatus, { tone: StatusTone; text: string }> = {
  complete: { tone: "success", text: "Done" },
  current: { tone: "pending", text: "In progress" },
  pending: { tone: "neutral", text: "Not started" },
  failed: { tone: "risk", text: "Needs action" },
  skipped: { tone: "neutral", text: "Not needed" },
}

const MARKER: Record<StepStatus, string> = {
  complete: "border-success/40 bg-success-surface text-success",
  current: "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
  pending: "border-border bg-background text-muted-foreground",
  failed: "border-risk/40 bg-risk-surface text-risk",
  skipped: "border-dashed border-border bg-background text-muted-foreground",
}

const STATUS_TEXT: Record<StepStatus, string> = {
  complete: "text-success",
  current: "text-primary",
  pending: "text-muted-foreground",
  failed: "text-risk",
  skipped: "text-muted-foreground",
}

type StepTimelineProps = Omit<React.ComponentProps<"ol">, "children"> & {
  steps: Array<TimelineStep>
}

function StepTimeline({ className, steps, ...props }: StepTimelineProps) {
  return (
    <ol data-slot="step-timeline" className={cn("grid", className)} {...props}>
      {steps.map((step, index) => {
        const status = STATUS[step.status]
        const isLast = index === steps.length - 1
        return (
          <li
            key={step.id}
            aria-current={step.status === "current" ? "step" : undefined}
            className="relative grid grid-cols-[1.75rem_1fr] gap-x-3 pb-5 last:pb-0"
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-7 bottom-0 left-[0.8125rem] w-px",
                  step.status === "complete" ? "bg-success/40" : "bg-border"
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "font-mono-num flex size-7 items-center justify-center rounded-full border text-[11px]",
                MARKER[step.status]
              )}
            >
              {step.status === "complete" ||
              step.status === "failed" ||
              step.status === "current" ? (
                <StatusIcon tone={status.tone} />
              ) : (
                index + 1
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  className={cn(
                    "text-label",
                    step.status === "skipped"
                      ? "text-muted-foreground line-through decoration-muted-foreground/40"
                      : "text-foreground"
                  )}
                >
                  {step.label}
                </span>
                <span className={cn("text-label-xs", STATUS_TEXT[step.status])}>
                  {status.text}
                </span>
              </div>
              {step.description && (
                <div className="text-copy-sm mt-0.5 text-muted-foreground">
                  {step.description}
                </div>
              )}
              {step.detail && <div className="mt-2">{step.detail}</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export { StepTimeline }
export type { StepStatus, TimelineStep }
