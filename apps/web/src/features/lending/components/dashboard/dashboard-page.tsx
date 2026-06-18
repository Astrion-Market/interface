import { useWallet } from "../../../wallet/wallet-provider"
import { useLendingPortfolio } from "../../hooks/queries/use-lending-portfolio"
import { SectionHeader } from "../shared/section-header"
import { ActivePositionsTable } from "./active-positions-table"
import { MarketInsights } from "./market-insights"
import { PortfolioSummaryBar } from "./portfolio-summary-bar"

export function DashboardPage() {
  const { address } = useWallet()
  const { data } = useLendingPortfolio(address)
  const positions = data?.positions ?? []

  return (
    <div className="flex h-full flex-col xl:flex-row">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Your lending positions at a glance
          </p>
        </div>

        <div className="mb-6">
          <PortfolioSummaryBar />
        </div>

        <div className="space-y-3">
          <SectionHeader
            title="Active Positions"
            description="Your current supply and borrow positions"
          />
          {/* Table wrapper — horizontal scroll on small screens */}
          <div className="overflow-x-auto">
            <ActivePositionsTable positions={positions} />
          </div>
        </div>
      </div>

      {/* Right insights panel — full-width on mobile, fixed sidebar on xl */}
      <div className="border-t border-border px-4 py-5 sm:px-6 xl:w-64 xl:shrink-0 xl:overflow-y-auto xl:border-l xl:border-t-0 xl:px-4 xl:py-6">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Market Insights
        </p>
        <MarketInsights />
      </div>
    </div>
  )
}
