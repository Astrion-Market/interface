import { StatusBadge } from "@workspace/ui/components/status-badge"
import { AddressText } from "../../lending/components/primitives/address-text"
import { DataFreshness } from "../../lending/components/primitives/data-freshness"
import { RiskStatus } from "../../lending/components/primitives/risk-status"
import { formatUnits } from "../../lending/lib/amounts"
import { ROUTE_EVM_NETWORKS } from "../env"
import { borrowRate } from "../model"
import { priceKey } from "../positions"
import { compoundRisk, morphoRisk } from "../risk"
import { planFullRepay, withdrawLimit } from "../settlement"
import type { Market, Token } from "../model"
import type { PositionRead } from "../positions"
import type { Prices, RiskReading } from "../risk"

// Expected time USDC spends in transit; sizes the full-repay buffer.
export const TRANSIT_SECONDS = 30 * 60

const fmt = (raw: bigint, token: Token) => `${formatUnits(raw, token.decimals).text} ${token.symbol}`

export function positionDebt(market: Market, position: PositionRead | null): bigint | null {
  if (!position) return null
  if (market.protocol === "compound-v3") {
    if (position.baseBalance === undefined || position.baseBalance === null) return null
    return position.baseBalance < 0n ? -position.baseBalance : 0n
  }
  return position.debt
}

export function positionSupply(market: Market, position: PositionRead | null): bigint | null {
  if (!position) return null
  if (market.protocol === "compound-v3") {
    if (position.baseBalance === undefined || position.baseBalance === null) return null
    return position.baseBalance > 0n ? position.baseBalance : 0n
  }
  return position.supplied
}

export function postedCollateral(market: Market, position: PositionRead | null, token: Token): bigint | null {
  if (!position) return null
  if (market.protocol === "morpho-blue") return position.collateral ?? null
  if (market.protocol === "compound-v3") return position.collaterals?.[priceKey(token.chain, token.address)] ?? 0n
  return null
}

export function fullRepayPlan(market: Market, position: PositionRead | null) {
  const debt = positionDebt(market, position)
  return debt === null || debt === 0n ? null : planFullRepay(debt, borrowRate(market), TRANSIT_SECONDS)
}

export function RepayPanel({
  market,
  token,
  position,
  mode,
  onModeChange,
}: {
  market: Market
  token: Token
  position: PositionRead | null
  mode: "partial" | "full"
  onModeChange: (mode: "partial" | "full") => void
}) {
  const debt = positionDebt(market, position)
  const plan = fullRepayPlan(market, position)
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-heading-card">Your debt</h2>
        {position && <DataFreshness updatedAt={new Date(position.readAt)} />}
      </div>
      <p className="font-mono-num text-[15px]">
        {debt === null ? <span className="text-copy-sm text-muted-foreground">Can&apos;t be read yet</span> : fmt(debt, token)}
      </p>
      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Repayment size</legend>
        <label className="text-copy-sm flex items-center gap-2">
          <input type="radio" name="repay-mode" checked={mode === "partial"} onChange={() => onModeChange("partial")} />
          Repay part
        </label>
        <label className="text-copy-sm flex items-center gap-2">
          <input type="radio" name="repay-mode" checked={mode === "full"} disabled={!plan} onChange={() => onModeChange("full")} />
          Repay in full
        </label>
      </fieldset>
      {mode === "full" && plan && (
        <div className="space-y-1 rounded-lg bg-muted/60 p-3">
          <p className="text-copy-sm">
            Sends <span className="font-mono-num font-medium">{fmt(plan.send, token)}</span>: your debt plus a{" "}
            <span className="font-mono-num">{fmt(plan.buffer, token)}</span> buffer for about {TRANSIT_SECONDS / 60} minutes
            of interest while USDC is in transit.
          </p>
          <p className="text-copy-sm text-muted-foreground">
            Your debt is read again right before the repayment runs. Anything left over stays in your execution account
            for you to withdraw. If interest outruns the buffer, you&apos;ll be asked for a small top-up; declining it leaves
            the remaining debt shown here and never locks the USDC already delivered.
          </p>
        </div>
      )}
      {!plan && debt !== 0n && (
        <p className="text-copy-sm text-muted-foreground">
          Full repayment needs your current debt and the borrow rate. Repay part, or repay directly from your EVM wallet.
        </p>
      )}
      {debt === 0n && <StatusBadge tone="success">No debt in this market</StatusBadge>}
    </section>
  )
}

export function DirectRepayInstructions({ market, token }: { market: Market; token: Token }) {
  const network = ROUTE_EVM_NETWORKS[market.ref.chain]
  const target =
    market.protocol === "aave-v3"
      ? { label: "Aave pool", address: market.ref.pool, call: "repay(asset, amount, 2, onBehalfOf)" }
      : market.protocol === "morpho-blue"
        ? { label: "Morpho Blue, market ID", address: market.ref.marketId, call: "repay(marketParams, assets, 0, onBehalf, \"\")" }
        : { label: "Comet", address: market.ref.comet, call: "supplyTo(dst, baseAsset, amount)" }
  return (
    <details className="rounded-xl border border-border bg-card p-4">
      <summary className="text-label cursor-pointer">Repay directly from your EVM wallet instead</summary>
      <div className="mt-3 space-y-2">
        <p className="text-copy-sm text-muted-foreground">
          Use this when bridging doesn&apos;t fit: small amounts where fees pass 1%, a delayed bridge, or a position close to
          liquidation. No Stellar transfer is involved.
        </p>
        <ol className="text-copy-sm list-decimal space-y-1 pl-5">
          <li>Switch your EVM wallet to {network.name} and hold enough {token.symbol} plus a little ETH for fees.</li>
          <li>
            Approve {token.symbol} for the {target.label}: <AddressText value={target.address} label="contract" />
          </li>
          <li>
            Call <code className="font-mono-num text-[12px]">{target.call}</code> with your execution account as the
            borrower.
          </li>
        </ol>
        <p className="text-copy-sm text-muted-foreground">Addresses shown are unverified preview values until deployment manifests exist.</p>
      </div>
    </details>
  )
}

export function withdrawChecks(market: Market, position: PositionRead | null, amount: bigint | null) {
  const supplied = positionSupply(market, position)
  const limit = withdrawLimit(supplied, market.availableLiquidity)
  const blockers: Array<string> = []
  if (limit.max === null) blockers.push("Your supply or the market's liquidity can't be read, so the maximum is unknown.")
  else if (amount !== null && amount > limit.max)
    blockers.push(
      limit.limitedBy === "liquidity"
        ? "The market doesn't have enough liquidity for this withdrawal right now."
        : market.protocol === "compound-v3"
          ? "Withdrawing more than your supply would open a borrow in Compound."
          : "This is more than you have supplied."
    )
  return { limit, blockers }
}

export function WithdrawPanel({ market, token, position }: { market: Market; token: Token; position: PositionRead | null }) {
  const { limit } = withdrawChecks(market, position, null)
  return (
    <section className="space-y-2 rounded-xl border border-border bg-card p-4">
      <h2 className="text-heading-card">What you can withdraw</h2>
      <p className="text-copy-sm">
        {limit.max === null ? (
          "Can't be read yet."
        ) : (
          <>
            Up to <span className="font-mono-num font-medium">{fmt(limit.max, token)}</span>
            {limit.limitedBy === "liquidity" && " (limited by the market's available liquidity)"}.
          </>
        )}
      </p>
      <ul className="text-copy-sm list-disc space-y-0.5 pl-5 text-muted-foreground">
        {market.protocol !== "aave-v3" && (
          <li>{market.protocol === "morpho-blue" ? "Morpho" : "Compound"} tracks supply as shares; the exact USDC amount is set when the withdrawal runs.</li>
        )}
        {market.protocol === "aave-v3" && <li>If this supply backs a borrow, withdrawing lowers your health factor.</li>}
        <li>Only USDC returns to Stellar. Collateral like WETH stays on the lending chain until you withdraw it there.</li>
        <li>The withdrawal and the transfer to Stellar are separate steps; if the transfer stalls, the USDC waits in your execution account.</li>
      </ul>
    </section>
  )
}

export function collateralWithdrawPreview(
  market: Market,
  position: PositionRead | null,
  token: Token,
  amount: bigint | null,
  prices: Prices
): { posted: bigint | null; risk: RiskReading | null; blockers: Array<string> } {
  const posted = postedCollateral(market, position, token)
  const blockers: Array<string> = []
  if (posted === null) return { posted, risk: null, blockers: ["Your posted collateral can't be read yet."] }
  if (amount === null) return { posted, risk: null, blockers }
  if (amount > posted) blockers.push("This is more collateral than you've posted.")
  const remaining = amount > posted ? 0n : posted - amount
  let risk: RiskReading | null = null
  if (market.protocol === "morpho-blue") risk = morphoRisk(market, remaining, position?.debt ?? null, prices)
  if (market.protocol === "compound-v3")
    risk = compoundRisk(market, position?.baseBalance ?? null, { ...position?.collaterals, [priceKey(token.chain, token.address)]: remaining }, prices)
  if (risk?.level === "at-risk") blockers.push("This withdrawal would put the position at risk of liquidation.")
  if (risk?.level === "unknown") blockers.push("Risk after this withdrawal can't be measured.")
  return { posted, risk, blockers }
}

export function CollateralWithdrawPanel({
  token,
  preview,
}: {
  token: Token
  preview: ReturnType<typeof collateralWithdrawPreview>
}) {
  return (
    <section className="space-y-2 rounded-xl border border-border bg-card p-4">
      <h2 className="text-heading-card">After this withdrawal</h2>
      <p className="text-copy-sm">
        Posted: {preview.posted === null ? "can't be read yet" : <span className="font-mono-num">{fmt(preview.posted, token)}</span>}
      </p>
      {preview.risk && <RiskStatus level={preview.risk.level} metric={preview.risk.metric} reason={preview.risk.reason} />}
      <p className="text-copy-sm text-muted-foreground">
        Collateral returns to your EVM wallet on the lending chain; it doesn&apos;t move to Stellar. The protocol rejects
        unsafe withdrawals on-chain; this preview doesn&apos;t replace that check.
      </p>
    </section>
  )
}
