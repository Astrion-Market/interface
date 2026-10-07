import { StatusIcon } from "@workspace/ui/components/status-badge"
import { cn } from "@workspace/ui/lib/utils"

type StatePanelProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

// Use when a list or panel has loaded and there is genuinely nothing to show.
function EmptyState({
  className,
  title,
  description,
  action,
  ...props
}: StatePanelProps) {
  return (
    <div
      data-slot="empty-state"
      role="status"
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border border-dashed border-border px-5 py-6",
        className
      )}
      {...props}
    >
      <p className="text-label text-foreground">{title}</p>
      {description && (
        <div className="text-copy-sm max-w-prose text-muted-foreground">
          {description}
        </div>
      )}
      {action && <div className="mt-2 flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}

// Use when data could not be read. Never substitute an empty or zero state.
function ErrorState({
  className,
  title,
  description,
  action,
  ...props
}: StatePanelProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border border-risk/30 bg-risk-surface px-5 py-6",
        className
      )}
      {...props}
    >
      <p className="text-label flex items-center gap-2 text-risk">
        <StatusIcon tone="risk" />
        {title}
      </p>
      {description && (
        <div className="text-copy-sm max-w-prose text-foreground/80">
          {description}
        </div>
      )}
      {action && <div className="mt-2 flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}

export { EmptyState, ErrorState }
