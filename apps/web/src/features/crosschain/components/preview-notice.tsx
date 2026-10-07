import { StatusBadge } from "@workspace/ui/components/status-badge"

export function PreviewNotice({ note }: { note?: string }) {
  return (
    <div
      role="note"
      className="flex flex-col gap-1.5 rounded-lg border border-attention/30 bg-attention-surface px-4 py-3 sm:flex-row sm:items-center sm:gap-3"
    >
      <StatusBadge tone="attention">Preview data</StatusBadge>
      <p className="text-copy-sm text-foreground/80">
        {note ??
          "Illustrative fixture values, not live market data. Addresses are unverified and every action is disabled."}
      </p>
    </div>
  )
}
