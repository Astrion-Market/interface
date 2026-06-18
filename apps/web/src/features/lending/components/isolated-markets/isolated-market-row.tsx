import { toast } from "sonner"
import type { Market } from "../../types/lending"
import { AssetIcon } from "../shared/asset-icon"

type Props = { market: Market }

export function IsolatedMarketRow({ market }: Props) {
  const cs = () => toast.info("Coming soon")

  return (
    <tr className="border-b border-border transition-colors hover:bg-amber-500/5">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <AssetIcon symbol={market.symbol} size="sm" />
          <div>
            <p className="text-[13px] font-medium">{market.symbol}</p>
            <p className="text-[11px] text-muted-foreground">{market.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-emerald-500">
        {market.supplyApy.toFixed(2)}%
      </td>
      <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-amber-500">
        {market.borrowApy.toFixed(2)}%
      </td>
      <td className="px-4 py-3 text-[12px] tabular-nums">{market.totalSupplied}</td>
      <td className="px-4 py-3 text-[12px] tabular-nums">{market.availableLiquidity}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                market.utilization >= 90 ? "bg-red-500" : market.utilization >= 70 ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${market.utilization}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground">{market.utilization}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-[12px] tabular-nums">{market.ltv}%</td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <button onClick={cs} className="rounded bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90">
            Supply
          </button>
          <button onClick={cs} className="rounded border border-amber-500/30 px-2.5 py-1 text-[11px] text-amber-400 hover:border-amber-500/60">
            Borrow
          </button>
        </div>
      </td>
    </tr>
  )
}
