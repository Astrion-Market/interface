import { MetricCard } from "../shared/metric-card"
import { HealthFactorGauge } from "../shared/health-factor-gauge"
import { useWallet } from "../../../wallet/wallet-provider"
import { useLendingPortfolio } from "../../hooks/queries/use-lending-portfolio"

export function PortfolioSummaryBar() {
  const { address } = useWallet()
  const { data, isFetching } = useLendingPortfolio(address)
  const summary = data?.summary
  const loadingValue = isFetching ? "Syncing" : "—"

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <MetricCard
        label="Net Worth"
        value={summary?.netWorth ?? loadingValue}
        sub={address ? "Wallet position value" : "Connect wallet to view"}
      />
      <MetricCard
        label="Total Supplied"
        value={summary?.totalSupplied ?? loadingValue}
        sub="Across all markets"
        accent="blue"
      />
      <MetricCard
        label="Total Borrowed"
        value={summary?.totalBorrowed ?? loadingValue}
        sub="Outstanding debt"
      />
      <MetricCard
        label="Available to Borrow"
        value={summary?.availableToBorrow ?? loadingValue}
        sub="Based on collateral"
        accent="green"
      />
      <div className="col-span-2 rounded-lg border border-border bg-card p-4 sm:col-span-1">
        <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
          Health Factor
        </p>
        <div className="mt-1 flex justify-center">
          <HealthFactorGauge value={summary?.healthFactor ?? null} size="sm" />
        </div>
      </div>
    </div>
  )
}
