import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { AssetIcon } from "../shared/asset-icon"
import { LendingTransactionDialog } from "../transactions/lending-transaction-dialog"
import type { LendingAction } from "../transactions/lending-transaction-dialog"
import type { Position } from "../../types/lending"

type Props = { positions: Array<Position> }

export function SupplyPositionsTable({ positions }: Props) {
  const [selected, setSelected] = useState<{
    action: LendingAction
    position: Position
  } | null>(null)

  return (
    <>
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-[13px] font-medium text-foreground">
            Your Supplies
          </p>
          <Button
            onClick={() => {
              window.location.href = "/markets"
            }}
          >
            + Supply
          </Button>
        </div>
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-[12px] text-muted-foreground">
              Nothing supplied yet.
            </p>
            <Button
              variant="link"
              onClick={() => {
                window.location.href = "/markets"
              }}
            >
              Explore Markets
            </Button>
          </div>
        ) : (
          <table className="w-full min-w-[680px] text-[13px]">
            <thead>
              <tr className="bg-muted/20 text-left">
                {["Asset", "Balance", "APY", "Collateral", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {positions.map((p) => (
                <tr key={p.id} className="hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AssetIcon symbol={p.symbol} size="sm" />
                      <span className="font-medium">{p.symbol}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {p.supplied}{" "}
                    <span className="text-muted-foreground">
                      ({p.suppliedUsd})
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-emerald-500">
                    {p.supplyApy.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-medium ${p.collateralEnabled ? "text-emerald-500" : "text-muted-foreground"}`}
                    >
                      {p.collateralEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          setSelected({ action: "withdraw", position: p })
                        }
                      >
                        Withdraw
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          setSelected({ action: "supply", position: p })
                        }
                      >
                        Supply More
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
