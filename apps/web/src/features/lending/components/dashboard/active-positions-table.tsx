import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { AssetIcon } from "../shared/asset-icon"
import { LendingTransactionDialog } from "../transactions/lending-transaction-dialog"
import type { LendingAction } from "../transactions/lending-transaction-dialog"
import type { Position } from "../../types/lending"

type Props = {
  positions: Array<Position>
}

export function ActivePositionsTable({ positions }: Props) {
  const [selected, setSelected] = useState<{
    action: LendingAction
    position: Position
  } | null>(null)

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
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
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        </div>
        <p className="text-[13px] font-medium text-foreground">
          No active positions
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Supply an asset or borrow from the Markets page to get started.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            window.location.href = "/markets"
          }}
        >
          Go to Markets
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full min-w-[700px] text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                "Asset",
                "Supplied",
                "Borrowed",
                "Supply APY",
                "Borrow APY",
                "Collateral",
                "Health",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {positions.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AssetIcon symbol={p.symbol} size="sm" />
                    <span className="font-medium">{p.symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">{p.supplied}</td>
                <td className="px-4 py-3 tabular-nums">{p.borrowed}</td>
                <td className="px-4 py-3 text-emerald-500 tabular-nums">
                  {p.supplyApy.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-amber-500 tabular-nums">
                  {p.borrowApy.toFixed(2)}%
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[11px] font-medium ${p.collateralEnabled ? "text-emerald-500" : "text-muted-foreground"}`}
                  >
                    {p.collateralEnabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {p.healthFactor !== null ? (
                    <span
                      className={
                        p.healthFactor >= 1.5
                          ? "text-emerald-500"
                          : p.healthFactor >= 1.2
                            ? "text-amber-500"
                            : "text-red-500"
                      }
                    >
                      {p.healthFactor.toFixed(2)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {(["supply", "withdraw", "borrow", "repay"] as const).map(
                      (action) => (
                        <Button
                          key={action}
                          variant="outline"
                          size="xs"
                          onClick={() => setSelected({ action, position: p })}
                        >
                          {action[0].toUpperCase() + action.slice(1)}
                        </Button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <LendingTransactionDialog
          action={selected.action}
          market={{
            id: selected.position.marketId,
            symbol: selected.position.symbol,
            name: selected.position.symbol,
          }}
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
        />
      ) : null}
    </>
  )
}
