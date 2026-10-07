import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { EmptyState, ErrorState } from "@workspace/ui/components/state-panel"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { cn } from "@workspace/ui/lib/utils"
import { DataFreshness } from "../../lending/components/primitives/data-freshness"
import { ChainBadge, ProtocolBadge, protocolLabel } from "../../lending/components/primitives/identity-badge"
import { CHAINS, EXECUTION_CHAIN_IDS, PROTOCOL_IDS } from "../../lending/lib/identity"
import { findRoute } from "../fixture-client"
import { borrowRate, lendRate, loanToken, marketActions, marketPathId } from "../model"
import { useCrosschainMarkets } from "../use-crosschain-markets"
import { displayAmount, displayRate, rateSortValue } from "./format"
import { PreviewNotice } from "./preview-notice"
import { RouteMatrix } from "./route-matrix"
import type { ExecutionChainId, ProtocolId } from "../../lending/lib/identity"
import type { Market, RouteAvailability } from "../model"

export type ExplorerAction = "lend" | "borrow"
export type ExplorerSort = "lend-rate" | "borrow-rate" | "liquidity"
export type ExplorerFilters = {
  chain?: ExecutionChainId
  protocol?: ProtocolId
  action?: ExplorerAction
  sort?: ExplorerSort
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T | undefined
  options: Array<{ value: T | undefined; label: string }>
  onChange: (value: T | undefined) => void
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden="true" className="text-label-xs w-16 text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "text-copy-sm rounded-md border px-2.5 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected
                  ? "border-primary bg-primary/10 font-medium text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function nullsLast(a: number | null, b: number | null, direction: 1 | -1) {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return (a - b) * direction
}

function sortMarkets(markets: Array<Market>, sort: ExplorerSort | undefined) {
  if (!sort) return markets
  return [...markets].sort((a, b) => {
    if (sort === "lend-rate") return nullsLast(rateSortValue(lendRate(a)), rateSortValue(lendRate(b)), -1)
    if (sort === "borrow-rate") return nullsLast(rateSortValue(borrowRate(a)), rateSortValue(borrowRate(b)), 1)
    // Liquidity only compares within one asset; group by symbol first.
    const symbol = loanToken(a).symbol.localeCompare(loanToken(b).symbol)
    if (symbol !== 0) return symbol
    const la = a.availableLiquidity
    const lb = b.availableLiquidity
    if (la === null || lb === null) return la === lb ? 0 : la === null ? 1 : -1
    return la === lb ? 0 : la > lb ? -1 : 1
  })
}

function MarketFlags({ market, route }: { market: Market; route: RouteAvailability | undefined }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {route?.enabled ? (
        <StatusBadge tone="success">Route open</StatusBadge>
      ) : (
        <StatusBadge tone="neutral">Actions disabled</StatusBadge>
      )}
      {market.protocol === "aave-v3" && market.status !== "active" && (
        <StatusBadge tone="attention">{market.status === "frozen" ? "Frozen" : "Paused"}</StatusBadge>
      )}
      {market.protocol === "compound-v3" && market.paused.length > 0 && (
        <StatusBadge tone="attention">Partly paused</StatusBadge>
      )}
      {market.protocol === "morpho-blue" && !market.approved && (
        <StatusBadge tone="risk">Not approved</StatusBadge>
      )}
    </div>
  )
}

function RateCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-label-xs text-muted-foreground uppercase md:hidden">{label}</p>
      <p className={cn("font-mono-num text-[13px]", value === "Not available" ? "text-muted-foreground" : "text-foreground")}>
        {value}
      </p>
    </div>
  )
}

function MarketRow({ market, route, action }: { market: Market; route: RouteAvailability | undefined; action?: ExplorerAction }) {
  const token = loanToken(market)
  const liquidity = displayAmount(market.availableLiquidity, token, 0)
  const borrowable = marketActions(market).includes("borrow")
  return (
    <li className="relative grid gap-3 px-4 py-4 hover:bg-muted/40 md:grid-cols-[minmax(0,2.2fr)_1fr_1fr_1.2fr_minmax(0,1.6fr)] md:items-center md:gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <ProtocolBadge protocol={market.protocol} />
          <ChainBadge chain={market.ref.chain} size="sm" />
        </div>
        <Link
          to="/markets/$chain/$protocol/$marketId"
          params={{ chain: market.ref.chain, protocol: market.protocol, marketId: marketPathId(market.ref) }}
          className="text-label block text-foreground after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none"
        >
          {market.name}
          <span className="sr-only">
            {" "}
            on {protocolLabel(market.protocol)}, {CHAINS[market.ref.chain].label}
          </span>
        </Link>
        {market.protocol === "compound-v3" && (
          <p className="text-copy-sm text-muted-foreground">
            Collateral: {market.collaterals.map((c) => c.token.symbol).join(", ")} (earns no interest)
          </p>
        )}
      </div>
      <div className={cn(action === "borrow" && "max-md:hidden md:opacity-50")}>
        <RateCell label="Lend" value={displayRate(lendRate(market))} />
      </div>
      <div className={cn(action === "lend" && "max-md:hidden md:opacity-50")}>
        <RateCell label="Borrow" value={borrowable ? displayRate(borrowRate(market)) : "Not borrowable"} />
      </div>
      <div>
        <p className="text-label-xs text-muted-foreground uppercase md:hidden">Available</p>
        <p
          className={cn("font-mono-num text-[13px]", market.availableLiquidity === null ? "text-muted-foreground" : "text-foreground")}
          title={liquidity.exact}
        >
          {liquidity.text}
        </p>
      </div>
      <div className="relative z-10 flex flex-col items-start gap-1.5">
        <MarketFlags market={market} route={route} />
        <DataFreshness
          updatedAt={market.readAt ? new Date(market.readAt) : null}
          state={market.dataState}
        />
      </div>
    </li>
  )
}

export function MarketExplorer({
  filters,
  onFiltersChange,
}: {
  filters: ExplorerFilters
  onFiltersChange: (next: ExplorerFilters) => void
}) {
  const { data, error, isLoading } = useCrosschainMarkets()
  const [showUnapproved, setShowUnapproved] = useState(false)
  const set = (patch: Partial<ExplorerFilters>) => onFiltersChange({ ...filters, ...patch })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    )
  }
  if (error || !data) {
    return (
      <ErrorState
        title="Couldn't load market data"
        description={error instanceof Error ? error.message : "The market source returned nothing."}
      />
    )
  }

  const matching = data.markets.filter(
    (m) =>
      (!filters.chain || m.ref.chain === filters.chain) &&
      (!filters.protocol || m.protocol === filters.protocol) &&
      (filters.action !== "borrow" || marketActions(m).includes("borrow"))
  )
  const unapproved = matching.filter((m) => m.protocol === "morpho-blue" && !m.approved)
  const visible = sortMarkets(
    showUnapproved ? matching : matching.filter((m) => !unapproved.includes(m)),
    filters.sort
  )

  return (
    <div className="space-y-5">
      <PreviewNotice />

      <div className="space-y-2.5 rounded-xl border border-border bg-card p-4">
        <Segmented
          label="Action"
          value={filters.action}
          onChange={(action) => set({ action })}
          options={[
            { value: undefined, label: "All" },
            { value: "lend", label: "Lend" },
            { value: "borrow", label: "Borrow" },
          ]}
        />
        <Segmented
          label="Chain"
          value={filters.chain}
          onChange={(chain) => set({ chain })}
          options={[{ value: undefined, label: "All" }, ...EXECUTION_CHAIN_IDS.map((c) => ({ value: c, label: CHAINS[c].label }))]}
        />
        <Segmented
          label="Protocol"
          value={filters.protocol}
          onChange={(protocol) => set({ protocol })}
          options={[{ value: undefined, label: "All" }, ...PROTOCOL_IDS.map((p) => ({ value: p, label: protocolLabel(p) }))]}
        />
        <Segmented
          label="Sort"
          value={filters.sort}
          onChange={(sort) => set({ sort })}
          options={[
            { value: undefined, label: "Default" },
            { value: "lend-rate", label: "Highest lend rate" },
            { value: "borrow-rate", label: "Lowest borrow rate" },
            { value: "liquidity", label: "Liquidity" },
          ]}
        />
        <p className="text-copy-sm pt-1 text-muted-foreground">
          Rates exclude one-time bridge and network costs, which depend on your amount. Compound reports APR;
          Aave and Morpho report APY. Liquidity sorts within each asset.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-copy-sm text-muted-foreground" aria-live="polite">
          {visible.length} market{visible.length === 1 ? "" : "s"}
        </p>
        {unapproved.length > 0 && (
          <button
            type="button"
            aria-pressed={showUnapproved}
            onClick={() => setShowUnapproved((v) => !v)}
            className="text-copy-sm rounded-sm text-primary underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {showUnapproved
              ? "Hide unapproved markets"
              : `Show ${unapproved.length} discovered market${unapproved.length === 1 ? "" : "s"} not on the approved list`}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No markets match these filters"
          description="Try another chain, protocol, or action."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            aria-hidden="true"
            className="text-label-xs hidden grid-cols-[minmax(0,2.2fr)_1fr_1fr_1.2fr_minmax(0,1.6fr)] gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-muted-foreground uppercase md:grid"
          >
            <span>Market</span>
            <span>Lend rate</span>
            <span>Borrow rate</span>
            <span>Available</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-border">
            {visible.map((market) => (
              <MarketRow
                key={market.key}
                market={market}
                route={findRoute(data.routes, market.ref.chain, market.protocol)}
                action={filters.action}
              />
            ))}
          </ul>
        </div>
      )}

      <RouteMatrix routes={data.routes} />
    </div>
  )
}
