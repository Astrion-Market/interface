import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { StrKey } from "@stellar/stellar-sdk"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import { RiskStatus } from "../../lending/components/primitives/risk-status"
import { RouteSummary } from "../../lending/components/primitives/route-summary"
import { formatUnits, parseUnits } from "../../lending/lib/amounts"
import { useEvmWallet } from "../../wallet/evm/evm-wallet-provider"
import { useWallet } from "../../wallet/wallet-provider"
import { ROUTE_ENV } from "../env"
import { findRoute } from "../fixture-client"
import { ACTION_LABEL, loanToken, marketActions } from "../model"
import { useOperations } from "../operations-store"
import { actionLegs, isReady, runPreflight } from "../preflight"
import { buildQuote, quoteFingerprint, validateQuote } from "../quote"
import { previewBorrow } from "../risk"
import { useRouteReadiness } from "../use-route-readiness"
import { PreflightChecklist } from "./preflight-checklist"
import { PreviewNotice } from "./preview-notice"
import type { RouteLeg } from "../../lending/components/primitives/route-summary"
import type { MarketFixture } from "../fixture-client"
import type { AaveReserve, Market, Token } from "../model"
import type { SimulationScenario } from "../operations-store"
import type { Quote, QuoteRequest } from "../quote"

export type ComposerAction = "lend" | "borrow" | "repay" | "withdraw"

const VERB: Record<ComposerAction, "Lend" | "Borrow" | "Repay" | "Withdraw"> = {
  lend: "Lend",
  borrow: "Borrow",
  repay: "Repay",
  withdraw: "Withdraw",
}

function routeLegs(market: Market, action: ComposerAction, collateral?: Token): Array<RouteLeg> {
  const chain = market.ref.chain
  const destination: RouteLeg = { kind: "destination", chain, protocol: market.protocol, action: VERB[action] }
  const { funding, payout } = actionLegs(action)
  const legs: Array<RouteLeg> = []
  if (funding === "stellar") legs.push({ kind: "origin", chain: "stellar", asset: "USDC" })
  else legs.push({ kind: "origin", chain, asset: action === "borrow" ? `${collateral?.symbol ?? "Collateral"} collateral` : "Your supply" })
  legs.push(destination)
  if (payout === "stellar") legs.push({ kind: "receive", chain: "stellar", asset: "USDC" })
  return legs
}

function collateralChoices(market: Market, all: Array<Market>): Array<{ token: Token; reserve?: AaveReserve }> {
  if (market.protocol === "morpho-blue") return [{ token: market.collateralToken }]
  if (market.protocol === "compound-v3") return market.collaterals.map((c) => ({ token: c.token }))
  return all
    .filter(
      (m): m is AaveReserve =>
        m.protocol === "aave-v3" && m.ref.chain === market.ref.chain && m.key !== market.key && m.collateral.enabled
    )
    .map((reserve) => ({ token: reserve.asset, reserve }))
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-label">{label}</span>
      {children}
      {hint && !error && <span className="text-copy-sm block text-muted-foreground">{hint}</span>}
      {error && <span className="text-copy-sm block text-risk">{error}</span>}
    </label>
  )
}

function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function TransactionComposer({ data, market, action }: { data: MarketFixture; market: Market; action: ComposerAction }) {
  const stellar = useWallet()
  const evm = useEvmWallet()
  const ops = useOperations()
  const navigate = useNavigate()
  const now = useNow()
  const readiness = useRouteReadiness(market.ref.chain)
  const route = findRoute(data.routes, market.ref.chain, market.protocol)
  const token = loanToken(market)
  const { payout } = actionLegs(action)

  const [amountText, setAmountText] = useState("")
  const [recipientText, setRecipientText] = useState<string | null>(null)
  const recipient = recipientText ?? stellar.address ?? ""
  const choices = useMemo(() => collateralChoices(market, data.markets), [market, data.markets])
  const [collateralAddress, setCollateralAddress] = useState(choices.at(0)?.token.address ?? "")
  const collateralChoice = choices.find((c) => c.token.address === collateralAddress)
  const [collateralText, setCollateralText] = useState("")
  const [quote, setQuote] = useState<Quote | null>(null)
  const [scenario, setScenario] = useState<SimulationScenario>("success")

  const amount = amountText === "" ? null : parseUnits(amountText, token.decimals)
  const amountError = amountText !== "" && amount === null ? `Enter a ${token.symbol} amount with at most ${token.decimals} decimals.` : null
  const recipientValid = payout !== "stellar" || StrKey.isValidEd25519PublicKey(recipient)
  const collateralAmount =
    action === "borrow" && collateralChoice ? (collateralText === "" ? null : parseUnits(collateralText, collateralChoice.token.decimals)) : null

  const borrow =
    action === "borrow" && collateralChoice && collateralAmount !== null && amount !== null
      ? previewBorrow(market, collateralChoice.token, collateralAmount, amount, data.prices, collateralChoice.reserve)
      : null

  const request: QuoteRequest | null =
    amount !== null && amount > 0n && recipientValid && (action !== "borrow" || collateralAmount !== null)
      ? {
          env: market.env,
          marketKey: market.key,
          action,
          amount,
          recipient: payout === "stellar" ? recipient : null,
          owner: { stellar: stellar.address, evm: evm.session.account },
          collateral: action === "borrow" && collateralChoice && collateralAmount !== null
            ? { token: collateralChoice.token.address, amount: collateralAmount }
            : null,
        }
      : null

  const issues = validateQuote(quote, request, now)
  const checks = runPreflight({ routeEnv: ROUTE_ENV, market, route, action, amount, ...readiness })
  const signBlockers = [
    ...(isReady(checks) ? [] : ["Some route checks need attention."]),
    ...issues.map((i) => i.message),
    ...(borrow?.blockers ?? []),
    "Signing is turned off until the transaction builders and pre-sign simulation are connected.",
  ]
  const quoteUsable = quote !== null && !issues.some((i) => i.kind === "changed" || i.kind === "expired" || i.kind === "invalid")
  const secondsLeft = quote ? Math.max(0, Math.ceil((quote.expiresAt - now) / 1000)) : 0

  if (!marketActions(market).includes(action)) {
    return <p className="text-copy-sm">This market doesn&apos;t offer {ACTION_LABEL[action].toLowerCase()}.</p>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <Link
        to="/markets/$chain/$protocol/$marketId"
        params={{ chain: market.ref.chain, protocol: market.protocol, marketId: market.key.split(":")[2] }}
        className="text-copy-sm text-primary underline-offset-2 hover:underline"
      >
        ← {market.name}
      </Link>
      <div>
        <h1 className="text-heading-page">Review: {ACTION_LABEL[action].toLowerCase()} {token.symbol}</h1>
        <p className="text-copy-sm mt-1 text-muted-foreground">Getting a quote needs no wallet signature and moves nothing.</p>
      </div>
      {market.env === "fixture" && <PreviewNotice />}
      <RouteSummary
        legs={routeLegs(market, action, collateralChoice?.token)}
        note={
          action === "lend"
            ? `Interest starts once the supply is confirmed on ${market.ref.chain === "base" ? "Base" : "Ethereum"}, not while USDC is bridging.`
            : action === "borrow"
              ? "Collateral and debt stay on the lending chain. Your debt is live as soon as the borrow confirms, even while USDC is on its way to Stellar."
              : action === "repay"
                ? "Interest keeps accruing while USDC is in transit, so a full repayment may need a refreshed amount."
                : "The market checks liquidity and your risk before the withdrawal; USDC then returns to Stellar."
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          {action === "borrow" && (
            <section className="space-y-3 rounded-xl border border-border bg-card p-4">
              <h2 className="text-heading-card">Collateral</h2>
              <p className="text-copy-sm text-muted-foreground">
                Comes from your EVM wallet on {market.ref.chain === "base" ? "Base" : "Ethereum"}. XLM in your Stellar wallet
                can&apos;t be used, and positions in other markets don&apos;t add borrowing capacity here.
              </p>
              <Field label="Asset">
                <select
                  value={collateralAddress}
                  onChange={(e) => {
                    setCollateralAddress(e.target.value)
                    setQuote(null)
                  }}
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-[13px]"
                >
                  {choices.map((c) => (
                    <option key={c.token.address} value={c.token.address}>
                      {c.token.symbol}
                      {c.reserve && c.reserve.status !== "active" ? ` (${c.reserve.status})` : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={`${collateralChoice?.token.symbol ?? "Collateral"} to post`}
                error={collateralText !== "" && collateralAmount === null ? "Enter a valid amount." : null}
              >
                <Input inputMode="decimal" value={collateralText} onChange={(e) => setCollateralText(e.target.value)} placeholder="0.0" />
              </Field>
            </section>
          )}

          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <Field
              label={`${ACTION_LABEL[action]} amount`}
              hint={`${token.symbol} on ${market.ref.chain === "base" ? "Base" : "Ethereum"}, up to ${token.decimals} decimals.`}
              error={amountError}
            >
              <div className="relative">
                <Input inputMode="decimal" value={amountText} onChange={(e) => setAmountText(e.target.value)} placeholder="0.00" className="pr-14" />
                <span className="text-copy-sm absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">{token.symbol}</span>
              </div>
            </Field>
            {payout === "stellar" && (
              <Field
                label="Stellar recipient"
                hint="USDC arrives here. It needs a USDC trustline."
                error={recipient !== "" && !recipientValid ? "Enter a valid Stellar account (G…)." : null}
              >
                <Input value={recipient} onChange={(e) => setRecipientText(e.target.value.trim())} placeholder="G…" className="font-mono text-[12px]" />
              </Field>
            )}
          </section>

          {borrow && (
            <section className="space-y-3 rounded-xl border border-border bg-card p-4">
              <h2 className="text-heading-card">Risk after this borrow</h2>
              <RiskStatus level={borrow.projected.level} metric={borrow.projected.metric} reason={borrow.projected.reason} />
              {borrow.maxBorrow !== null && (
                <p className="text-copy-sm text-muted-foreground">
                  Most you can borrow against this collateral: {formatUnits(borrow.maxBorrow, token.decimals, { maxFractionDigits: 2 }).text} {token.symbol}
                </p>
              )}
              {borrow.blockers.length > 0 && (
                <ul className="text-copy-sm list-disc space-y-0.5 pl-5 text-risk">
                  {borrow.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-heading-card">Route checks</h2>
            <PreflightChecklist checks={checks} />
          </section>
        </div>

        <aside className="space-y-4 rounded-xl border border-border bg-card p-4 lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-heading-card">Quote</h2>
            {quote &&
              (quoteUsable ? (
                <StatusBadge tone="neutral">Expires in {secondsLeft}s</StatusBadge>
              ) : (
                <StatusBadge tone="attention">Needs refresh</StatusBadge>
              ))}
          </div>
          <Button
            variant="outline"
            className="w-full"
            disabled={!request}
            onClick={() => request && setQuote(buildQuote(request, market, data.fees, Date.now(), collateralChoice?.token.symbol))}
          >
            {quote ? "Refresh quote" : "Get quote"}
          </Button>
          {quote && (
            <>
              <dl className="space-y-1.5">
                {quote.fees.map((fee) => (
                  <div key={fee.label} className="flex items-start justify-between gap-3">
                    <dt className="text-copy-sm text-muted-foreground">
                      {fee.label}
                      {fee.payer === "sponsor" && " (sponsored)"}
                    </dt>
                    <dd className="font-mono-num text-right text-[12.5px]">
                      {formatUnits(fee.amount, fee.decimals).text} {fee.symbol}
                    </dd>
                  </div>
                ))}
                <div className="flex items-start justify-between gap-3 border-t border-border pt-1.5">
                  <dt className="text-copy-sm text-muted-foreground">
                    {action === "borrow" || action === "withdraw" ? "Least you receive on Stellar" : "Least that reaches the market"}
                  </dt>
                  <dd className="font-mono-num text-right text-[12.5px] font-medium">
                    {formatUnits(quote.minimumResult, token.decimals).text} {token.symbol}
                  </dd>
                </div>
              </dl>
              <div>
                <h3 className="text-label mb-1.5">Signatures, in order</h3>
                <ol className="space-y-1.5">
                  {quote.signatures.map((s, i) => (
                    <li key={s.label} className="flex items-start gap-2">
                      <span className="font-mono-num flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px]">{i + 1}</span>
                      <span className="text-copy-sm">
                        <span className="font-medium">{s.wallet === "stellar" ? "Stellar wallet" : "EVM wallet"}:</span> {s.label}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
          <div className="space-y-2 border-t border-border pt-3">
            <Button className="w-full" disabled aria-describedby="sign-blockers">
              Sign and submit
            </Button>
            <ul id="sign-blockers" className="text-copy-sm list-disc space-y-0.5 pl-4 text-muted-foreground">
              {signBlockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          {market.env === "fixture" && (
            <div className="space-y-2 rounded-lg border border-dashed border-attention/40 p-3">
              <p className="text-label">Simulated run</p>
              <p className="text-copy-sm text-muted-foreground">Walks through tracking with fake events. No wallet is used and no funds move.</p>
              <fieldset className="space-y-1">
                <legend className="sr-only">Scenario</legend>
                {(
                  [
                    ["success", "Everything succeeds"],
                    ["action-fails", `The ${ACTION_LABEL[action].toLowerCase()} on the lending chain fails`],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="text-copy-sm flex items-center gap-2">
                    <input type="radio" name="scenario" checked={scenario === value} onChange={() => setScenario(value)} />
                    {label}
                  </label>
                ))}
              </fieldset>
              <Button
                variant="outline"
                className="w-full"
                disabled={
                  !quoteUsable ||
                  !request ||
                  (borrow?.blockers.length ?? 0) > 0 ||
                  checks.some((c) => c.id === "asset" && c.status === "fail")
                }
                onClick={() => {
                  if (!quote || !request) return
                  const result = ops.startSimulation({
                    intentId: `${quoteFingerprint(request)}@${quote.createdAt}`,
                    kind: action,
                    chain: market.ref.chain,
                    marketKey: market.key,
                    amount: request.amount,
                    scenario,
                  })
                  void navigate({ to: "/activity/$operationId", params: { operationId: result.id } })
                }}
              >
                Run simulation
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
