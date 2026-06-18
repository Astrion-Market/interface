import { toast } from "sonner"

type InsightRow = {
  label: string
  value: string
  sub?: string
}

const PROTOCOL_STATS: InsightRow[] = [
  { label: "Protocol TVL", value: "—", sub: "Total Value Locked" },
  { label: "Total Borrowed", value: "—", sub: "Across all markets" },
  { label: "Active Markets", value: "—" },
]

export function MarketInsights() {
  return (
    <div className="space-y-4">
      {/* Protocol stats */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Protocol Overview
        </p>
        <div className="space-y-3">
          {PROTOCOL_STATS.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-muted-foreground">{row.label}</p>
                {row.sub && <p className="text-[10px] text-muted-foreground/60">{row.sub}</p>}
              </div>
              <span className="font-mono text-[13px] font-medium tabular-nums text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top earning */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Top Earning Markets
        </p>
        <div className="space-y-2">
          {([] as { symbol: string; apy: number }[]).length === 0 ? (
            <p className="text-[12px] text-muted-foreground/60">No data available</p>
          ) : null}
        </div>
        <button
          onClick={() => toast.info("Coming soon")}
          className="mt-3 w-full rounded border border-border py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          View All Markets →
        </button>
      </div>

      {/* Utilization */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Utilization
        </p>
        <div className="space-y-2.5">
          {([] as { symbol: string; utilization: number }[]).map((m) => (
            <div key={m.symbol}>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="text-muted-foreground">{m.symbol}</span>
                <span className="tabular-nums text-foreground">{m.utilization}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${m.utilization}%` }}
                />
              </div>
            </div>
          ))}
          {([] as unknown[]).length === 0 && (
            <p className="text-[12px] text-muted-foreground/60">No data available</p>
          )}
        </div>
      </div>
    </div>
  )
}
