import { ProtocolStatsBar } from "./protocol-stats-bar"
import { ChartPlaceholder } from "./chart-placeholder"

export function AnalyticsPage() {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Protocol-wide metrics, historical rates, and market activity
        </p>
      </div>

      <div className="mb-6">
        <ProtocolStatsBar />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <ChartPlaceholder title="TVL Growth" subtitle="Total Value Locked over time" height="h-52" />
        <ChartPlaceholder title="Total Borrowed" subtitle="Outstanding debt over time" height="h-52" />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <ChartPlaceholder title="Supply APY History" subtitle="Average supply APY across all core markets" height="h-48" />
        <ChartPlaceholder title="Borrow APY History" subtitle="Average borrow APY across all core markets" height="h-48" />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ChartPlaceholder title="Market Utilization" subtitle="Per-market utilization breakdown" height="h-44" />
        <ChartPlaceholder title="Liquidation Activity" subtitle="Liquidations over the last 30 days" height="h-44" />
        <ChartPlaceholder title="Protocol Revenue" subtitle="Cumulative fee revenue" height="h-44" />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-[13px] font-medium text-foreground">Market Utilization Summary</p>
          <p className="text-[11px] text-muted-foreground">Current utilization across all active markets</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[12px] text-muted-foreground">No market data available yet</p>
        </div>
      </div>
    </div>
  )
}
