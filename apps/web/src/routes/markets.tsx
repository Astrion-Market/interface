import { useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { cn } from "@workspace/ui/lib/utils"
import { MarketExplorer } from "../features/crosschain/components/market-explorer"
import type { ExplorerFilters } from "../features/crosschain/components/market-explorer"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { MarketsPage } from "../features/lending/components/markets/markets-page"
import { STELLAR_NETWORK_LABEL } from "../features/lending/lib/network"
import { parseMarketSearch, toSearch } from "../features/lending/lib/route-params"

function VenueTabs({ stellar, onChange }: { stellar: boolean; onChange: (stellar: boolean) => void }) {
  const tabs = [
    { stellar: false, label: "Base & Ethereum", hint: "Preview" },
    { stellar: true, label: "Stellar", hint: STELLAR_NETWORK_LABEL },
  ]
  return (
    <div role="group" aria-label="Market venue" className="inline-flex rounded-lg border border-border bg-card p-1">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          aria-pressed={stellar === tab.stellar}
          onClick={() => onChange(tab.stellar)}
          className={cn(
            "text-copy-sm rounded-md px-3 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            stellar === tab.stellar ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          <span className="ml-1.5 text-muted-foreground">· {tab.hint}</span>
        </button>
      ))}
    </div>
  )
}

export default function Page() {
  const [params] = useSearchParams()
  const search = parseMarketSearch(Object.fromEntries(params))
  const navigate = useNavigate()
  // React Router applies navigations asynchronously and search-param updaters
  // see the last render, so quick successive filter clicks build on the last
  // requested filters until the URL catches up.
  const pending = useRef<ExplorerFilters | null>(null)
  useEffect(() => {
    pending.current = null
  }, [params])
  const stellar = search.venue === "stellar"

  return (
    <AppLayout>
      <div className="px-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-heading-page">Markets</h1>
            <p className="text-copy-sm mt-1 text-muted-foreground">
              {stellar ? "Existing Stellar lending markets." : "Planned lending markets on Base and Ethereum."}
            </p>
          </div>
          <VenueTabs
            stellar={stellar}
            onChange={(next) => void navigate(next ? "?venue=stellar" : "?")}
          />
        </div>
      </div>
      {stellar ? (
        <MarketsPage
          filter={search.type ?? "all"}
          onFilterChange={(filter) => {
            void navigate(toSearch({ venue: "stellar", type: filter === "isolated" ? "isolated" : undefined }))
          }}
        />
      ) : (
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <MarketExplorer
            filters={search}
            onFiltersChange={(patch) => {
              const { chain, protocol, action, sort } = pending.current ?? search
              const next = { chain, protocol, action, sort, ...patch }
              pending.current = next
              void navigate(toSearch(next) || "?", { replace: true })
            }}
          />
        </div>
      )}
    </AppLayout>
  )
}
