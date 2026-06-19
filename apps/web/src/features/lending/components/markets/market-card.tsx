import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { AssetIcon } from "../shared/asset-icon"
import { MarketBadge } from "../shared/market-badge"
import { LendingTransactionDialog } from "../transactions/lending-transaction-dialog"
import type { LendingAction } from "../transactions/lending-transaction-dialog"
import type { Market } from "../../types/lending"

type Props = {
  market: Market
}

function UtilizationBar({ value }: { value: number }) {
  const color =
    value >= 90 ? "bg-red-500" : value >= 70 ? "bg-amber-500" : "bg-primary"
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-muted-foreground">Utilization</span>
        <span className="text-foreground tabular-nums">{value}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function MarketCard({ market }: Props) {
  const isIsolated = market.type === "isolated"
  const [action, setAction] = useState<LendingAction | null>(null)

  return (
    <>
      <div
        className={`rounded-lg border bg-card transition-shadow hover:shadow-md ${
          isIsolated ? "border-amber-500/20" : "border-border"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-2.5">
            <AssetIcon symbol={market.symbol} size="md" />
            <div>
              <p className="font-medium text-foreground">{market.symbol}</p>
              <p className="text-[11px] text-muted-foreground">{market.name}</p>
            </div>
          </div>
          <MarketBadge type={market.type} />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-border px-4 py-3">
          <div>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Supply APY
            </p>
            <p className="mt-0.5 font-mono text-[15px] font-semibold text-emerald-500 tabular-nums">
              {market.supplyApy.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Borrow APY
            </p>
            <p className="mt-0.5 font-mono text-[15px] font-semibold text-amber-500 tabular-nums">
              {market.borrowApy.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Total Supplied
            </p>
            <p className="mt-0.5 font-mono text-[12px] text-foreground tabular-nums">
              {market.totalSupplied}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Available
            </p>
            <p className="mt-0.5 font-mono text-[12px] text-foreground tabular-nums">
              {market.availableLiquidity}
            </p>
          </div>
          {isIsolated ? (
            <>
              <div>
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  LLTV
                </p>
                <p className="mt-0.5 font-mono text-[12px] text-foreground tabular-nums">
                  {market.lltv ?? market.ltv}%
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  Liq. Penalty
                </p>
                <p className="mt-0.5 font-mono text-[12px] text-foreground tabular-nums">
                  {market.liquidationPenalty.toFixed(2)}%
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  LTV
                </p>
                <p className="mt-0.5 font-mono text-[12px] text-foreground tabular-nums">
                  {market.ltv}%
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  Liq. Threshold
                </p>
                <p className="mt-0.5 font-mono text-[12px] text-foreground tabular-nums">
                  {market.liquidationThreshold}%
                </p>
              </div>
            </>
          )}
        </div>

        {/* Utilization bar */}
        <div className="border-t border-border px-4 py-3">
          <UtilizationBar value={market.utilization} />
        </div>

        {/* Oracle */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">
              Oracle: {market.oracle}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/60">
            {market.oracleUpdated}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-border px-4 py-3">
          <Button className="flex-1" onClick={() => setAction("supply")}>
            Supply
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setAction("borrow")}
          >
            Borrow
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Withdraw ${market.symbol}`}
            onClick={() => setAction("withdraw")}
          >
            ↗
          </Button>
        </div>
      </div>

      {action ? (
        <LendingTransactionDialog
          action={action}
          market={market}
          open={Boolean(action)}
          onOpenChange={(open) => {
            if (!open) setAction(null)
          }}
        />
      ) : null}
    </>
  )
}
