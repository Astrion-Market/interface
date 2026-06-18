import { toast } from "sonner"
import { MOCK_PROPOSALS } from "../../data/mock-governance"
import { ProposalCard } from "./proposal-card"
import { MetricCard } from "../shared/metric-card"

export function GovernancePage() {
  const proposals = MOCK_PROPOSALS
  const active = proposals.filter((p) => p.status === "active")
  const passed = proposals.filter((p) => p.status === "passed")

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Governance</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Vote on protocol parameters, new markets, and risk settings
          </p>
        </div>
        <button
          onClick={() => toast.info("Coming soon")}
          className="rounded-md bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          + New Proposal
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Active Proposals" value={active.length.toString()} accent="green" />
        <MetricCard label="Passed" value={passed.length.toString()} accent="blue" />
        <MetricCard label="Total Proposals" value={proposals.length.toString()} />
        <MetricCard label="Your Voting Power" value="—" sub="Connect wallet" />
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-muted-foreground">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p className="text-[12px] font-medium text-foreground">On-Chain Governance</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            All protocol changes are governed by token holders. Proposals require quorum and majority to pass. Voting is binding and executed on-chain.
          </p>
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-foreground">No proposals yet</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Governance proposals will appear here once the protocol launches.
          </p>
          <button
            onClick={() => toast.info("Coming soon")}
            className="mt-4 rounded-md border border-border px-4 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Create First Proposal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  )
}
