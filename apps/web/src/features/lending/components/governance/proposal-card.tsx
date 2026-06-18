import { toast } from "sonner"
import type { Proposal } from "../../types/lending"

type Props = { proposal: Proposal }

const STATUS_STYLES: Record<Proposal["status"], { label: string; cls: string }> = {
  active:   { label: "Active",   cls: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10" },
  passed:   { label: "Passed",   cls: "text-blue-400 border-blue-500/25 bg-blue-500/10" },
  rejected: { label: "Rejected", cls: "text-red-400 border-red-500/25 bg-red-500/10" },
  pending:  { label: "Pending",  cls: "text-amber-400 border-amber-500/25 bg-amber-500/10" },
}

const CATEGORY_LABELS: Record<Proposal["category"], string> = {
  risk:     "Risk Parameter",
  market:   "New Market",
  fee:      "Fee Update",
  protocol: "Protocol Change",
}

export function ProposalCard({ proposal }: Props) {
  const cs = () => toast.info("Coming soon")
  const status = STATUS_STYLES[proposal.status]
  const total = proposal.votesFor + proposal.votesAgainst
  const forPct = total > 0 ? (proposal.votesFor / total) * 100 : 0

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.cls}`}>
              {status.label}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
              {CATEGORY_LABELS[proposal.category]}
            </span>
          </div>
          <p className="text-[14px] font-semibold text-foreground">{proposal.title}</p>
          <p className="mt-1 text-[12px] text-muted-foreground line-clamp-2">{proposal.description}</p>
        </div>
      </div>

      {/* Vote bar */}
      <div className="mb-3">
        <div className="mb-1.5 flex justify-between text-[11px]">
          <span className="text-emerald-400">For {forPct.toFixed(1)}%</span>
          <span className="text-red-400">Against {(100 - forPct).toFixed(1)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-red-500/30">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${forPct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{proposal.votesFor.toLocaleString()} votes</span>
          <span>Quorum: {proposal.quorum.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="text-[11px] text-muted-foreground">
          <span>Proposer: </span>
          <span className="font-mono">{proposal.proposer}</span>
          <span className="mx-2">·</span>
          <span>Deadline: {proposal.deadline}</span>
        </div>
        {proposal.status === "active" && (
          <div className="flex gap-1.5">
            <button
              onClick={cs}
              className="rounded border border-emerald-500/30 px-3 py-1 text-[11px] font-medium text-emerald-400 hover:border-emerald-500/60"
            >
              Vote For
            </button>
            <button
              onClick={cs}
              className="rounded border border-red-500/30 px-3 py-1 text-[11px] font-medium text-red-400 hover:border-red-500/60"
            >
              Vote Against
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
