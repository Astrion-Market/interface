import { HealthFactorGauge } from "../shared/health-factor-gauge"
import type { PortfolioSummary as PortfolioSummaryData } from "../../types/lending"

type Props = {
  summary?: PortfolioSummaryData
  isLoading?: boolean
  isConnected?: boolean
}

export function PortfolioSummary({ summary, isLoading, isConnected }: Props) {
  const fallback = isLoading ? "Syncing" : "—"
  const metrics = [
    { label: "Net Worth", value: summary?.netWorth ?? fallback },
    { label: "Net APY", value: summary?.netApy ?? fallback, accent: true },
    { label: "Total Collateral", value: summary?.totalCollateral ?? fallback },
    { label: "Total Debt", value: summary?.totalDebt ?? fallback },
  ]

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col items-center">
        <HealthFactorGauge value={summary?.healthFactor ?? null} size="md" />
      </div>

      <div className="hidden h-16 w-px bg-border sm:block" />

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {metrics.map(({ label, value, accent }) => (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`mt-1 font-mono text-xl font-semibold tabular-nums ${accent ? "text-emerald-500" : "text-foreground"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {!isConnected ? (
        <p className="basis-full text-[12px] text-muted-foreground">
          Connect your wallet to load on-chain positions.
        </p>
      ) : null}
    </div>
  )
}
