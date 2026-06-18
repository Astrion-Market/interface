import { MetricCard } from "../shared/metric-card"

export function ProtocolStatsBar() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard label="Total TVL" value="—" sub="All markets" accent="blue" />
      <MetricCard label="Total Borrowed" value="—" sub="Active debt" />
      <MetricCard label="Protocol Revenue" value="—" sub="Lifetime fees" accent="green" />
      <MetricCard label="Unique Suppliers" value="—" sub="Active wallets" />
    </div>
  )
}
