import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { AssetIcon } from "../shared/asset-icon"
import { LendingTransactionDialog } from "../transactions/lending-transaction-dialog"
import type { LendingAction } from "../transactions/lending-transaction-dialog"
import type { Position } from "../../types/lending"

type Props = { positions: Array<Position> }

export function BorrowPositionsTable({ positions }: Props) {
  const [selected, setSelected] = useState<{
    action: LendingAction
    position: Position
  } | null>(null)

  return (
    <>
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-[13px] font-medium text-foreground">
            Your Borrows
          </p>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/markets"
            }}
          >
            + Borrow
          </Button>
        </div>
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-[12px] text-muted-foreground">
              No active borrows.
            </p>
            <Button
              variant="link"
              onClick={() => {
                window.location.href = "/markets"
              }}
            >
              Borrow Against Collateral
            </Button>
          </div>
        ) : (
          <table className="w-full min-w-[680px] text-[13px]">
            <thead>
              <tr className="bg-muted/20 text-left">
                {[
                  "Asset",
                  "Debt",
                  "Collateral",
                  "APY",
                  "Health Factor",
                  "",
                ].map((h) => (
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
                    {p.borrowed}{" "}
                    <span className="text-muted-foreground">
                      ({p.borrowedUsd})
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {p.collateralEnabled ? (
                      <span className="text-foreground">
                        {p.collateral}{" "}
                        <span className="text-muted-foreground">
                          ({p.collateralUsd})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-amber-500">
                    {p.borrowApy.toFixed(2)}%
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
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          setSelected({ action: "repay", position: p })
                        }
                      >
                        Repay
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          setSelected({ action: "borrow", position: p })
                        }
                      >
                        Borrow More
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          setSelected({
                            action: "supply_collateral",
                            position: p,
                          })
                        }
                      >
                        + Collateral
                      </Button>
                      {p.collateralEnabled ? (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() =>
                            setSelected({
                              action: "withdraw_collateral",
                              position: p,
                            })
                          }
                        >
                          − Collateral
                        </Button>
                      ) : null}
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
            name:
              selected.position.collateralSymbol &&
              selected.position.loanSymbol
                ? `${selected.position.collateralSymbol} / ${selected.position.loanSymbol}`
                : selected.position.symbol,
            loanAsset: selected.position.loanAsset,
            collateralAsset: selected.position.collateralAsset,
            loanSymbol: selected.position.loanSymbol,
            collateralSymbol: selected.position.collateralSymbol,
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
