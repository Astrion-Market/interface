"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { useState } from "react"
import { useLendingMarkets } from "../../hooks/use-lending-markets"
import { MetricCard } from "../shared/metric-card"
import { MarketCard } from "./market-card"
import { MarketFilters } from "./market-filters"
import type { Market } from "../../types/lending"

type FilterType = "all" | "core" | "isolated"

function filterMarkets(
  markets: Array<Market>,
  search: string,
  filter: FilterType
) {
  return markets.filter((m) => {
    const matchesSearch =
      search === "" ||
      m.symbol.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || m.type === filter
    return matchesSearch && matchesFilter
  })
}

export function MarketsPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const {
    data: markets = [],
    error,
    isLoading,
    isFetching,
  } = useLendingMarkets()

  const filtered = filterMarkets(markets, search, filter)
  const coreMarkets = markets.filter((m) => m.type === "core")
  const isolatedMarkets = markets.filter((m) => m.type === "isolated")
  const totalBorrowed = markets.length === 0 ? "—" : `${markets.length} live`

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Markets</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Compare lending and borrowing opportunities across all markets
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Total TVL"
          value="—"
          sub="All markets combined"
          accent="blue"
        />
        <MetricCard
          label="Core Markets"
          value={coreMarkets.length.toString()}
          sub="Shared liquidity"
        />
        <MetricCard
          label="Isolated Markets"
          value={isolatedMarkets.length.toString()}
          sub="Separate risk"
          accent="amber"
        />
        <MetricCard
          label="Market Data"
          value={isFetching ? "Syncing" : totalBorrowed}
          sub="Soroban testnet"
        />
      </div>

      {error ? (
        <div className="mb-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-[12px] font-medium text-amber-500">
            Unable to read testnet markets
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {error.message}
          </p>
        </div>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MarketFilters
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />
        <span className="text-[12px] text-muted-foreground">
          {filtered.length} market{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-74 rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <p className="text-[13px] font-medium text-foreground">
            No markets available yet
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Markets will appear here once the protocol launches.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}

      {(filter === "all" || filter === "isolated") &&
        isolatedMarkets.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mt-0.5 shrink-0 text-amber-500"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-[12px] font-medium text-amber-500">
                Isolated Market Risk
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Isolated markets have separate liquidity, borrow caps, and
                liquidation rules.
              </p>
            </div>
          </div>
        )}
    </div>
  )
}
