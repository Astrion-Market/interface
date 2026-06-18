import { MOCK_MARKETS } from "../../data/mock-markets"
import { RiskWarningBanner } from "./risk-warning-banner"
import { IsolatedMarketRow } from "./isolated-market-row"
import { MetricCard } from "../shared/metric-card"

export function IsolatedMarketsPage() {
  const markets = MOCK_MARKETS.filter((m) => m.type === "isolated")

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Isolated Markets</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          High-risk assets with independent liquidity and liquidation rules
        </p>
      </div>

      <div className="mb-6">
        <RiskWarningBanner />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard label="Isolated Markets" value={markets.length.toString()} accent="amber" />
        <MetricCard label="Total Isolated TVL" value="—" />
        <MetricCard label="Total Isolated Borrowed" value="—" />
      </div>

      {markets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-amber-500/20 py-20 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-foreground">No isolated markets yet</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Isolated markets will be listed here once the protocol launches.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-amber-500/20">
          <table className="w-full min-w-[700px] text-[13px]">
            <thead>
              <tr className="border-b border-amber-500/20 bg-amber-500/5">
                {["Asset", "Supply APY", "Borrow APY", "Total Supplied", "Available", "Utilization", "LTV", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {markets.map((m) => (
                <IsolatedMarketRow key={m.id} market={m} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
