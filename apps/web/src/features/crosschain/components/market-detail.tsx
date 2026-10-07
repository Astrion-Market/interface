import { Link } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { AddressText } from "../../lending/components/primitives/address-text"
import { DataFreshness } from "../../lending/components/primitives/data-freshness"
import { ChainBadge, ProtocolBadge } from "../../lending/components/primitives/identity-badge"
import { ACTION_LABEL, actionAvailability, blockingReasons, loanToken } from "../model"
import { displayAmount, displayBps, displayCap, displayRate } from "./format"
import { PreviewNotice } from "./preview-notice"
import type {
  AaveReserve,
  ActionAvailability,
  CompoundComet,
  LendingAction,
  Market,
  MorphoMarket,
  RouteAvailability,
} from "../model"

function Stat({ label, value, hint, muted }: { label: string; value: React.ReactNode; hint?: string; muted?: boolean }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card px-3 py-2.5">
      <dt className="text-label-xs text-muted-foreground uppercase">{label}</dt>
      <dd className={`font-mono-num mt-1 text-[14px] break-words ${muted ? "text-muted-foreground" : "text-foreground"}`}>
        {value}
      </dd>
      {hint && <p className="text-label-xs mt-1 font-normal text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-heading-card">{title}</h2>
      {children}
    </section>
  )
}

function AmountStat({ label, raw, market, hint }: { label: string; raw: bigint | null; market: Market; hint?: string }) {
  const { text, exact } = displayAmount(raw, loanToken(market))
  return <Stat label={label} value={<span title={exact}>{text}</span>} hint={hint} muted={raw === null} />
}

function RateStat({ label, rate }: { label: string; rate: Parameters<typeof displayRate>[0] }) {
  return <Stat label={label} value={displayRate(rate)} muted={rate === null} />
}

function ActionGroup({
  title,
  description,
  actions,
  shared,
}: {
  title: string
  description?: string
  actions: Array<ActionAvailability>
  // Reasons that block every action; listed once above the groups.
  shared: Array<string>
}) {
  if (actions.length === 0) return null
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-label">{title}</h3>
        {description && <p className="text-copy-sm text-muted-foreground">{description}</p>}
      </div>
      <ul className="space-y-2">
        {actions.map((a) => {
          const reasonId = `reason-${a.action}`
          const own = a.reasons.filter((r) => !shared.includes(r))
          return (
            <li key={a.action} className="space-y-1">
              <Button
                variant="outline"
                className="h-8 w-full justify-between"
                disabled={!a.available}
                aria-describedby={a.available ? undefined : own.length > 0 ? `${reasonId} shared-reasons` : "shared-reasons"}
              >
                {ACTION_LABEL[a.action]}
                {!a.available && <span className="text-label-xs text-muted-foreground">Unavailable</span>}
              </Button>
              {own.length > 0 && (
                <ul id={reasonId} className="text-label-xs list-disc space-y-0.5 pl-4 font-normal text-attention">
                  {own.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function pick(actions: Array<ActionAvailability>, wanted: Array<LendingAction>) {
  return actions.filter((a) => wanted.includes(a.action))
}

function ActionPanel({ market, route }: { market: Market; route: RouteAvailability | undefined }) {
  const actions = actionAvailability(market, route)
  const shared = blockingReasons(market, route)
  const lendAsset = loanToken(market).symbol
  return (
    <aside className="space-y-5 rounded-xl border border-border bg-card p-4 lg:sticky lg:top-4">
      {shared.length > 0 && (
        <div className="rounded-lg bg-muted/60 px-3 py-2.5">
          <p className="text-label">Actions are disabled</p>
          <ul id="shared-reasons" className="text-copy-sm mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
            {shared.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      <ActionGroup
        title={`Lend ${lendAsset}`}
        description={
          market.protocol === "morpho-blue"
            ? "Lent USDC earns the market rate. It does not become collateral."
            : market.protocol === "compound-v3"
              ? "Base supply earns interest and cannot back a borrow."
              : "Supplied assets can also back a borrow when collateral is enabled."
        }
        actions={pick(actions, ["lend", "withdraw"])}
        shared={shared}
      />
      <ActionGroup
        title={market.protocol === "aave-v3" ? `Borrow ${lendAsset}` : "Borrow against collateral"}
        description={
          market.protocol === "morpho-blue"
            ? `Post ${market.collateralToken.symbol}, then borrow ${market.loanToken.symbol}.`
            : market.protocol === "compound-v3"
              ? `Post collateral, then borrow at least the minimum in ${market.baseToken.symbol}.`
              : undefined
        }
        actions={pick(actions, ["post-collateral", "withdraw-collateral", "borrow", "repay"])}
        shared={shared}
      />
    </aside>
  )
}

function AaveBody({ market }: { market: AaveReserve }) {
  const supplyCap = displayCap(market.supplyCap, market.totalSupplied, market.asset)
  const borrowCap = displayCap(market.borrowCap, market.totalBorrowed, market.asset)
  return (
    <>
      <Section title="Rates and liquidity">
        <dl className="grid gap-2 sm:grid-cols-3">
          <RateStat label="Supply rate" rate={market.supplyRate} />
          {market.borrowable ? (
            <RateStat label="Borrow rate" rate={market.borrowRate} />
          ) : (
            <Stat label="Borrow rate" value="Not borrowable" muted />
          )}
          <AmountStat label="Available liquidity" raw={market.availableLiquidity} market={market} />
          <AmountStat label="Total supplied" raw={market.totalSupplied} market={market} />
          <AmountStat label="Total borrowed" raw={market.totalBorrowed} market={market} />
          <Stat
            label="Supply cap"
            value={supplyCap.text}
            hint={supplyCap.reached ? "Cap reached: new supply is blocked" : undefined}
          />
          <Stat label="Borrow cap" value={borrowCap.text} hint={borrowCap.reached ? "Cap reached" : undefined} />
        </dl>
      </Section>
      <Section title="Collateral">
        {market.collateral.enabled ? (
          <dl className="grid gap-2 sm:grid-cols-3">
            <Stat label="Max LTV" value={displayBps(market.collateral.ltvBps)} hint="Most you can borrow against it" />
            <Stat label="Liquidation threshold" value={displayBps(market.collateral.liquidationThresholdBps)} />
            <Stat label="Liquidation penalty" value={displayBps(market.collateral.liquidationBonusBps)} />
          </dl>
        ) : (
          <p className="text-copy-sm text-muted-foreground">This reserve cannot be used as collateral.</p>
        )}
      </Section>
      {market.restrictions.length > 0 && (
        <Section title="Restrictions">
          <ul className="text-copy-sm list-disc space-y-1 pl-5 text-muted-foreground">
            {market.restrictions.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>
      )}
      <Section title="Contracts">
        <dl className="grid gap-2">
          <Stat label="Pool" value={<AddressText value={market.ref.pool} label="pool address" />} />
          <Stat label={`${market.asset.symbol} token`} value={<AddressText value={market.asset.address} label="token address" />} />
        </dl>
      </Section>
    </>
  )
}

function MorphoBody({ market }: { market: MorphoMarket }) {
  return (
    <>
      {!market.approved && (
        <div role="note" className="rounded-lg border border-risk/30 bg-risk-surface px-4 py-3">
          <p className="text-label text-risk">Not on Astrion&apos;s approved list</p>
          <p className="text-copy-sm mt-1 text-foreground/80">
            This market was returned by market discovery. Morpho Blue markets are permissionless, so a listing alone
            never makes one usable here.
          </p>
        </div>
      )}
      <Section title="Market identity">
        <p className="text-copy-sm text-muted-foreground">
          A Morpho Blue market is defined by all five parameters below. Markets with the same tokens but a different
          oracle or LLTV are separate markets with separate risk.
        </p>
        <dl className="grid gap-2 sm:grid-cols-2">
          <Stat label="Loan asset (lend and borrow)" value={market.loanToken.symbol} />
          <Stat label="Collateral asset (post only)" value={market.collateralToken.symbol} hint="Earns no interest" />
          <Stat label="LLTV" value={displayBps(market.lltvBps)} hint="Liquidation loan-to-value" />
          <Stat label="Listed by" value={market.listedBy === "registry" ? "Approved registry" : "Discovery API"} />
          <Stat label="Oracle" value={<AddressText value={market.oracle} label="oracle address" />} />
          <Stat label="Interest rate model" value={<AddressText value={market.irm} label="IRM address" />} />
          <Stat label="Market ID" value={<AddressText value={market.ref.marketId} label="market ID" />} />
        </dl>
      </Section>
      <Section title="Rates and liquidity">
        <dl className="grid gap-2 sm:grid-cols-3">
          <RateStat label="Lend rate" rate={market.supplyRate} />
          <RateStat label="Borrow rate" rate={market.borrowRate} />
          <AmountStat label="Available liquidity" raw={market.availableLiquidity} market={market} />
          <AmountStat label="Total lent" raw={market.totalSupplied} market={market} />
          <AmountStat label="Total borrowed" raw={market.totalBorrowed} market={market} />
        </dl>
      </Section>
      <p className="text-copy-sm text-muted-foreground">Morpho vaults are a separate product and outside the alpha.</p>
    </>
  )
}

function CompoundBody({ market }: { market: CompoundComet }) {
  return (
    <>
      <Section title={`Base asset: ${market.baseToken.symbol}`}>
        <p className="text-copy-sm text-muted-foreground">
          Your {market.baseToken.symbol} balance in this Comet is either supplied or borrowed, never both: borrowing
          first uses up any supply.
        </p>
        <dl className="grid gap-2 sm:grid-cols-3">
          <RateStat label="Supply rate" rate={market.baseSupplyRate} />
          <RateStat label="Borrow rate" rate={market.baseBorrowRate} />
          <Stat label="Minimum borrow" value={displayAmount(market.baseBorrowMin, market.baseToken).text} />
          <AmountStat label="Available liquidity" raw={market.availableLiquidity} market={market} />
          <AmountStat label="Total supplied" raw={market.totalSupplied} market={market} />
          <AmountStat label="Total borrowed" raw={market.totalBorrowed} market={market} />
        </dl>
      </Section>
      <Section title="Collateral assets">
        <p className="text-copy-sm text-muted-foreground">Collateral backs a borrow and earns no interest.</p>
        <ul className="space-y-2 sm:hidden">
          {market.collaterals.map((c) => {
            const cap = displayCap({ kind: "limit", amount: c.supplyCap }, c.totalSupplied, c.token)
            return (
              <li key={c.token.address} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-label">{c.token.symbol}</span>
                  <span className="text-label-xs text-muted-foreground">Earns no interest</span>
                </div>
                <dl className="font-mono-num mt-2 grid grid-cols-2 gap-2 text-[13px]">
                  <div>
                    <dt className="text-label-xs font-sans text-muted-foreground uppercase">Borrow factor</dt>
                    <dd>{displayBps(c.borrowCollateralFactorBps)}</dd>
                  </div>
                  <div>
                    <dt className="text-label-xs font-sans text-muted-foreground uppercase">Liquidation factor</dt>
                    <dd>{displayBps(c.liquidateCollateralFactorBps)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-label-xs font-sans text-muted-foreground uppercase">Supply cap used</dt>
                    <dd className="flex flex-wrap items-center gap-2">
                      {cap.text}
                      {cap.reached && <StatusBadge tone="attention">Cap reached</StatusBadge>}
                    </dd>
                  </div>
                </dl>
              </li>
            )
          })}
        </ul>
        <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
          <table className="w-full min-w-[560px] text-left">
            <thead className="text-label-xs bg-muted/40 text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Asset</th>
                <th scope="col" className="px-3 py-2 font-medium">Borrow factor</th>
                <th scope="col" className="px-3 py-2 font-medium">Liquidation factor</th>
                <th scope="col" className="px-3 py-2 font-medium">Supply cap used</th>
                <th scope="col" className="px-3 py-2 font-medium">Interest</th>
              </tr>
            </thead>
            <tbody className="font-mono-num divide-y divide-border text-[13px]">
              {market.collaterals.map((c) => {
                const cap = displayCap({ kind: "limit", amount: c.supplyCap }, c.totalSupplied, c.token)
                return (
                  <tr key={c.token.address}>
                    <th scope="row" className="px-3 py-2.5 font-medium">{c.token.symbol}</th>
                    <td className="px-3 py-2.5">{displayBps(c.borrowCollateralFactorBps)}</td>
                    <td className="px-3 py-2.5">{displayBps(c.liquidateCollateralFactorBps)}</td>
                    <td className="px-3 py-2.5">
                      <span className="flex flex-wrap items-center gap-2">
                        {cap.text}
                        {cap.reached && <StatusBadge tone="attention">Cap reached</StatusBadge>}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">None</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>
      {market.paused.length > 0 && (
        <p className="text-copy-sm text-attention">
          Paused by Compound governance: {market.paused.join(", ").replaceAll("-", " ")}.
        </p>
      )}
      <Section title="Contracts">
        <dl className="grid gap-2">
          <Stat label="Comet" value={<AddressText value={market.ref.comet} label="Comet address" />} />
        </dl>
      </Section>
    </>
  )
}

export function MarketDetail({ market, route }: { market: Market; route: RouteAvailability | undefined }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <Link to="/markets" className="text-copy-sm text-primary underline-offset-2 hover:underline">
        ← All markets
      </Link>
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ProtocolBadge protocol={market.protocol} />
          <ChainBadge chain={market.ref.chain} />
          {market.protocol === "aave-v3" && market.status !== "active" && (
            <StatusBadge tone="attention">{market.status === "frozen" ? "Frozen" : "Paused"}</StatusBadge>
          )}
        </div>
        <h1 className="text-heading-page">{market.name}</h1>
        <DataFreshness updatedAt={market.readAt ? new Date(market.readAt) : null} state={market.dataState} />
      </header>
      <PreviewNotice />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {market.protocol === "aave-v3" && <AaveBody market={market} />}
          {market.protocol === "morpho-blue" && <MorphoBody market={market} />}
          {market.protocol === "compound-v3" && <CompoundBody market={market} />}
        </div>
        <ActionPanel market={market} route={route} />
      </div>
    </div>
  )
}
