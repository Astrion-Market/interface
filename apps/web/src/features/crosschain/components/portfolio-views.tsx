import { Link } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { EmptyState, ErrorState } from "@workspace/ui/components/state-panel"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { AddressText } from "../../lending/components/primitives/address-text"
import { DataFreshness } from "../../lending/components/primitives/data-freshness"
import { ChainBadge, ProtocolBadge } from "../../lending/components/primitives/identity-badge"
import { RiskStatus } from "../../lending/components/primitives/risk-status"
import { CHAINS } from "../../lending/lib/identity"
import { formatUnits } from "../../lending/lib/amounts"
import { useEvmWallet } from "../../wallet/evm/evm-wallet-provider"
import { operationStatus } from "../lifecycle"
import { marketPathId } from "../model"
import { useOperations } from "../operations-store"
import { buildPortfolioView, readLabel } from "../portfolio-model"
import { formatUsdE8 } from "../risk"
import { useCrosschainMarkets } from "../use-crosschain-markets"
import { PreviewNotice } from "./preview-notice"
import type { Holding, PortfolioView, PositionRow } from "../portfolio-model"

function HoldingText({ holding }: { holding: Holding }) {
  return (
    <span className="font-mono-num text-[13px]">
      {formatUnits(holding.amount, holding.token.decimals, { maxFractionDigits: 4 }).text} {holding.token.symbol}
      <span className="ml-1.5 text-muted-foreground">{holding.usd === null ? "(value unknown)" : formatUsdE8(holding.usd)}</span>
    </span>
  )
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-label-xs text-muted-foreground uppercase">{label}</p>
      <p className="font-mono-num mt-1.5 text-xl font-semibold">{value}</p>
      {note && <p className="text-copy-sm mt-1 text-muted-foreground">{note}</p>}
    </div>
  )
}

function Totals({ view }: { view: PortfolioView }) {
  const unvalued = view.totals.unvalued > 0 ? `${view.totals.unvalued} holding(s) couldn't be valued and are left out.` : undefined
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Tile label="Supplied" value={formatUsdE8(view.totals.suppliedUsd)} note={unvalued ?? "Earning. Includes Aave supply that also backs borrowing."} />
      <Tile label="Collateral" value={formatUsdE8(view.totals.collateralUsd)} note="Morpho and Compound collateral. Earns nothing." />
      <Tile label="Debt" value={formatUsdE8(view.totals.debtUsd)} note="Accrues interest on each chain." />
    </div>
  )
}

function PositionCard({ row }: { row: PositionRow }) {
  return (
    <li className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <ProtocolBadge protocol={row.market.protocol} chain={row.market.ref.chain} />
          <Link
            to="/markets/$chain/$protocol/$marketId"
            params={{ chain: row.market.ref.chain, protocol: row.market.protocol, marketId: marketPathId(row.market.ref) }}
            className="text-label block hover:underline"
          >
            {row.market.name}
          </Link>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <DataFreshness updatedAt={new Date(row.readAt)} />
          {row.reconciled === true && <StatusBadge tone="success">Matches protocol</StatusBadge>}
          {row.reconciled === false && <StatusBadge tone="risk">Doesn&apos;t match protocol</StatusBadge>}
          {row.reconciled === null && <StatusBadge tone="neutral">Not yet reconciled</StatusBadge>}
        </div>
      </div>
      <dl className="grid gap-2 sm:grid-cols-3">
        <div>
          <dt className="text-label-xs text-muted-foreground uppercase">Supplied</dt>
          <dd>
            {row.supplied ? <HoldingText holding={row.supplied} /> : <span className="text-copy-sm text-muted-foreground">None</span>}
            {row.suppliedBacksBorrowing && <p className="text-label-xs mt-0.5 text-muted-foreground">Also backs your Aave borrowing</p>}
          </dd>
        </div>
        <div>
          <dt className="text-label-xs text-muted-foreground uppercase">Collateral (no interest)</dt>
          <dd className="space-y-0.5">
            {row.collateral.length === 0 ? (
              <span className="text-copy-sm text-muted-foreground">None</span>
            ) : (
              row.collateral.map((h) => (
                <div key={h.token.address}>
                  <HoldingText holding={h} />
                </div>
              ))
            )}
          </dd>
        </div>
        <div>
          <dt className="text-label-xs text-muted-foreground uppercase">Debt</dt>
          <dd>{row.debt ? <HoldingText holding={row.debt} /> : <span className="text-copy-sm text-muted-foreground">None</span>}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-end justify-between gap-2 border-t border-border pt-3">
        <RiskStatus
          level={row.risk.level}
          metric={row.risk.metric}
          reason={row.riskScope === "account" ? `Shared across your Aave account on ${CHAINS[row.market.ref.chain].label}.` : row.risk.reason}
        />
        {row.account && (
          <span className="text-copy-sm text-muted-foreground">
            Account <AddressText value={row.account} label="execution account" />
          </span>
        )}
      </div>
    </li>
  )
}

function InTransit() {
  const { operations } = useOperations()
  const open = operations.filter((op) => operationStatus(op).state !== "complete")
  if (open.length === 0) return null
  return (
    <section className="space-y-2">
      <h2 className="text-heading-card">In transit</h2>
      <p className="text-copy-sm text-muted-foreground">Not included in the totals above until they land.</p>
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {open.map((op) => {
          const status = operationStatus(op)
          return (
            <li key={op.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
              <Link to="/activity/$operationId" params={{ operationId: op.id }} className="text-label hover:underline">
                {op.kind[0].toUpperCase() + op.kind.slice(1)} {formatUnits(op.amount, 6, { maxFractionDigits: 2 }).text} USDC
              </Link>
              <span className="flex gap-1.5">
                {op.simulated && <StatusBadge tone="attention">Simulated</StatusBadge>}
                <StatusBadge tone={status.state === "needs-action" ? "risk" : "pending"}>{status.label}</StatusBadge>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Attention({ view }: { view: PortfolioView }) {
  if (view.attention.length === 0) return null
  return (
    <section aria-labelledby="attention-title" className="space-y-2">
      <h2 id="attention-title" className="text-heading-card">
        Needs attention
      </h2>
      <ul className="space-y-1.5">
        {view.attention.map((a) => (
          <li key={a.message} className="flex items-start gap-2">
            <StatusBadge tone={a.tone} className="mt-0.5 shrink-0">
              {a.tone === "risk" ? "Act" : "Check"}
            </StatusBadge>
            <span className="text-copy-sm">{a.message}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Wallet connected or not, but no live position readers exist yet.
function NoReaders({ title, sampleTo }: { title: string; sampleTo: "/portfolio" | "/dashboard" }) {
  const evm = useEvmWallet()
  const sampleLink = (
    <Button variant="outline" nativeButton={false} render={<Link to={sampleTo} search={{ sample: true }} />}>
      Preview with a sample account
    </Button>
  )
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      <h1 className="text-heading-page">{title}</h1>
      {evm.session.status === "connected" ? (
        <ErrorState
          title="Positions can't be read yet"
          description="Readers for Aave, Morpho, and Compound positions aren't connected. This is not the same as having no positions."
          action={sampleLink}
        />
      ) : (
        <EmptyState
          title="Connect your EVM wallet to see cross-chain positions"
          description="Positions live in execution accounts owned by your EVM wallet."
          action={sampleLink}
        />
      )}
      <InTransit />
      <p className="text-copy-sm text-muted-foreground">
        Existing Stellar lending positions are on the{" "}
        <Link to="/legacy" className="text-primary underline-offset-2 hover:underline">
          Stellar positions
        </Link>{" "}
        page.
      </p>
    </div>
  )
}

function useSampleView() {
  const { data, error, isLoading } = useCrosschainMarkets()
  const view = data ? buildPortfolioView(data.samplePortfolio, data.markets, data.prices, Date.now()) : null
  return { data, view, error, isLoading }
}

export function PositionsPage({ sample }: { sample: boolean }) {
  const { data, view, error, isLoading } = useSampleView()
  if (!sample) return <NoReaders title="Positions" sampleTo="/portfolio" />
  if (isLoading) return <Skeleton className="m-6 h-96" />
  if (error || !data || !view) return <ErrorState className="m-6" title="Couldn't load the sample portfolio" />
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-heading-page">Positions</h1>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/portfolio" />}>
          Exit sample
        </Button>
      </div>
      <PreviewNotice note={data.samplePortfolio.note} />
      {view.partial && (
        <ErrorState
          title="Some positions couldn't be read"
          description={view.failedReads.map((r) => `${readLabel(r.protocol, r.chain)}: ${r.reason}`).join(" ")}
        />
      )}
      <Totals view={view} />
      <Attention view={view} />
      <InTransit />
      {view.groups.map((group) => (
        <section key={group.chain} className="space-y-3">
          <h2 className="text-heading-card flex items-center gap-2">
            <ChainBadge chain={group.chain} />
          </h2>
          <ul className="space-y-3">
            {group.rows.map((row) => (
              <PositionCard key={row.market.key} row={row} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function OverviewPage({ sample }: { sample: boolean }) {
  const { data, view, error, isLoading } = useSampleView()
  if (!sample) return <NoReaders title="Overview" sampleTo="/dashboard" />
  if (isLoading) return <Skeleton className="m-6 h-96" />
  if (error || !data || !view) return <ErrorState className="m-6" title="Couldn't load the sample portfolio" />
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-heading-page">Overview</h1>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/dashboard" />}>
          Exit sample
        </Button>
      </div>
      <PreviewNotice note={data.samplePortfolio.note} />
      {view.partial && <ErrorState title="Totals are incomplete" description="Some positions couldn't be read. See Needs attention." />}
      <Totals view={view} />
      <Attention view={view} />
      <InTransit />
      <section className="space-y-2">
        <h2 className="text-heading-card">Where your positions are</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {view.groups.map((group) => (
            <li key={group.chain} className="rounded-xl border border-border bg-card p-4">
              <ChainBadge chain={group.chain} />
              <p className="text-copy-sm mt-2 text-muted-foreground">
                {group.rows.length} position{group.rows.length === 1 ? "" : "s"} across{" "}
                {[...new Set(group.rows.map((r) => r.market.protocol))].length} protocol(s)
              </p>
            </li>
          ))}
        </ul>
        <Button variant="outline" nativeButton={false} render={<Link to="/portfolio" search={{ sample: true }} />}>
          View positions
        </Button>
      </section>
    </div>
  )
}
