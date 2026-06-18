"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useWallet } from "../../../wallet/wallet-provider"
import { TOKEN_BY_CONTRACT } from "../../lib/astrion-contracts"
import { useBorrowMutation } from "../../hooks/mutations/use-borrow-mutation"
import { useRepayMutation } from "../../hooks/mutations/use-repay-mutation"
import { useSupplyMutation } from "../../hooks/mutations/use-supply-mutation"
import { useWithdrawMutation } from "../../hooks/mutations/use-withdraw-mutation"
import { useLendingMarkets } from "../../hooks/queries/use-lending-markets"
import { useLendingPortfolio } from "../../hooks/queries/use-lending-portfolio"
import { lendingQueryKeys } from "../../hooks/queries/query-keys"
import { useTokenBalance } from "../../hooks/queries/use-token-balance"
import { formatUsd } from "../../lib/stellar-format"
import type { WriteTransactionStep } from "../../lib/soroban"
import type { Market } from "../../types/lending"

export type LendingAction = "supply" | "withdraw" | "borrow" | "repay"

type Props = {
  action: LendingAction
  market: Pick<Market, "id" | "symbol" | "name">
  open: boolean
  onOpenChange: (open: boolean) => void
}

type DialogView = "review" | "progress"

const actionCopy: Record<LendingAction, { title: string; cta: string }> = {
  supply: { title: "Supply asset", cta: "Confirm supply" },
  withdraw: { title: "Withdraw asset", cta: "Confirm withdraw" },
  borrow: { title: "Borrow asset", cta: "Confirm borrow" },
  repay: { title: "Repay debt", cta: "Confirm repay" },
}

const actionVerb: Record<LendingAction, string> = {
  supply: "Supplying",
  withdraw: "Withdrawing",
  borrow: "Borrowing",
  repay: "Repaying",
}

const stepLabels: Array<{ step: WriteTransactionStep; label: string }> = [
  { step: "preparing", label: "Preparing" },
  { step: "signing", label: "Wallet signature" },
  { step: "submitting", label: "Submitting" },
  { step: "confirming", label: "Confirming" },
  { step: "confirmed", label: "Confirmed" },
]

function stepIndex(step: WriteTransactionStep) {
  return stepLabels.findIndex((item) => item.step === step)
}

function formatHealthFactor(value: number | null | undefined) {
  if (value == null) return "No debt"
  return value.toFixed(2)
}

export function LendingTransactionDialog({
  action,
  market,
  open,
  onOpenChange,
}: Props) {
  const { address, connect, isConnecting } = useWallet()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState("")
  const [view, setView] = useState<DialogView>("review")
  const [step, setStep] = useState<WriteTransactionStep>("idle")
  const currentStep = stepIndex(step)
  const token = TOKEN_BY_CONTRACT[market.id]
  const {
    data: balance,
    error: balanceError,
    isFetching: isBalanceFetching,
  } = useTokenBalance(address, market.id)
  const { data: markets } = useLendingMarkets()
  const { data: portfolio, isFetching: isPortfolioFetching } =
    useLendingPortfolio(address)
  const supply = useSupplyMutation(setStep)
  const withdraw = useWithdrawMutation(setStep)
  const borrow = useBorrowMutation(setStep)
  const repay = useRepayMutation(setStep)
  const mutation = { supply, withdraw, borrow, repay }[action]
  const copy = actionCopy[action]
  const isFinal = step === "confirmed"
  const isBusy = mutation.isPending || isConnecting
  const activeMarket = markets?.find((item) => item.id === market.id)
  const oraclePrice = activeMarket?.oraclePrice ?? 0
  const amountNumber = Number(amount)
  const amountValueUsd =
    Number.isFinite(amountNumber) && amountNumber > 0
      ? amountNumber * oraclePrice
      : 0
  const summary = portfolio?.summary
  const projectedDebtUsd =
    action === "borrow" ? (summary?.totalDebtUsd ?? 0) + amountValueUsd : 0
  const projectedAvailableUsd =
    action === "borrow"
      ? Math.max(0, (summary?.borrowCapacityUsd ?? 0) - projectedDebtUsd)
      : 0
  const projectedHealthFactor =
    action === "borrow" && projectedDebtUsd > 0
      ? (summary?.liquidationCapacityUsd ?? 0) / projectedDebtUsd
      : null
  const formattedAmount =
    amountNumber > 0 && Number.isFinite(amountNumber)
      ? `${amount} ${market.symbol}`
      : `0 ${market.symbol}`
  const formattedAmountValue =
    oraclePrice > 0 ? formatUsd(amountValueUsd) : "USD value unavailable"
  const showBorrowPreview = action === "borrow" && view === "review"

  const description = useMemo(() => {
    const network = "Stellar testnet"
    if (view === "progress") {
      return "Approve in your wallet and wait for on-chain confirmation."
    }
    return `${market.symbol} on ${network}. Review the amount, confirm here, then approve in your wallet.`
  }, [market.symbol, view])

  useEffect(() => {
    if (open) return
    setAmount("")
    setView("review")
    setStep("idle")
  }, [open])

  async function closeDialog(nextOpen: boolean) {
    if (!nextOpen && isBusy && !isFinal) return

    onOpenChange(nextOpen)
    if (!nextOpen && isFinal) {
      await queryClient.invalidateQueries({ queryKey: lendingQueryKeys.all })
    }
  }

  async function submit() {
    if (!address) {
      await connect()
      return
    }

    if (!token) {
      toast.error("Unsupported market asset")
      return
    }

    setView("progress")
    mutation.mutate({
      userAddress: address,
      marketId: market.id,
      amount,
    })
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent
        showCloseButton={isFinal || !isBusy}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {view === "review" ? (
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                  Market
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {market.symbol}
                </p>
              </div>
              <p className="text-[12px] text-muted-foreground">{market.name}</p>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[11px] tracking-wider text-muted-foreground uppercase">
                  Amount
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Balance:{" "}
                  {address
                    ? isBalanceFetching
                      ? "Loading"
                      : balanceError
                        ? "Unavailable"
                        : (balance?.formatted ?? `0 ${market.symbol}`)
                    : "Connect wallet"}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  disabled={isBusy || isFinal}
                  onChange={(event) => setAmount(event.target.value)}
                />
                <span className="min-w-12 text-right text-[12px] font-medium text-muted-foreground">
                  {market.symbol}
                </span>
              </div>
              {action === "borrow" ? (
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {oraclePrice > 0
                    ? `${formatUsd(amountValueUsd)} at ${formatUsd(oraclePrice)} / ${market.symbol}`
                    : "USD value unavailable"}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {showBorrowPreview ? (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/10 p-3">
            {[
              {
                id: "health-factor",
                label: "Health Factor",
                value: isPortfolioFetching
                  ? "Loading"
                  : formatHealthFactor(summary?.healthFactor),
              },
              {
                id: "projected-health-factor",
                label: "After Borrow",
                value: isPortfolioFetching
                  ? "Loading"
                  : formatHealthFactor(projectedHealthFactor),
                accent:
                  projectedHealthFactor !== null &&
                  projectedHealthFactor < 1.5,
              },
              {
                id: "available-to-borrow",
                label: "Available",
                value: isPortfolioFetching
                  ? "Loading"
                  : (summary?.availableToBorrow ?? "$0.00"),
              },
              {
                id: "projected-available",
                label: "After Borrow",
                value: isPortfolioFetching
                  ? "Loading"
                  : formatUsd(projectedAvailableUsd),
              },
              {
                id: "borrow-value",
                label: "Borrow Value",
                value: formatUsd(amountValueUsd),
              },
              {
                id: "projected-debt",
                label: "Total Debt",
                value: isPortfolioFetching
                  ? "Loading"
                  : formatUsd(projectedDebtUsd),
              },
            ].map(({ id, label, value, accent }) => (
              <div key={id} className="rounded-md bg-background/40 p-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p
                  className={[
                    "mt-1 font-mono text-[13px] font-semibold tabular-nums",
                    accent ? "text-amber-500" : "text-foreground",
                  ].join(" ")}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {view === "progress" ? (
          <>
            <div className="rounded-lg border border-border bg-muted/10 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Transaction Summary
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {actionVerb[action]} {formattedAmount}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Value: {formattedAmountValue}
              </p>
              {action === "borrow" ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Health Factor
                    </p>
                    <p className="mt-0.5 font-mono font-semibold text-foreground">
                      {formatHealthFactor(summary?.healthFactor)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      After Borrow
                    </p>
                    <p
                      className={[
                        "mt-0.5 font-mono font-semibold",
                        projectedHealthFactor !== null &&
                        projectedHealthFactor < 1.5
                          ? "text-amber-500"
                          : "text-foreground",
                      ].join(" ")}
                    >
                      {formatHealthFactor(projectedHealthFactor)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Available After
                    </p>
                    <p className="mt-0.5 font-mono font-semibold text-foreground">
                      {formatUsd(projectedAvailableUsd)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Total Debt
                    </p>
                    <p className="mt-0.5 font-mono font-semibold text-foreground">
                      {formatUsd(projectedDebtUsd)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              {stepLabels.map((item, index) => {
                const isDone = currentStep > index || step === "confirmed"
                const isActive = currentStep === index && step !== "confirmed"
                return (
                  <div
                    key={item.step}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    <span
                      className={[
                        "flex size-5 items-center justify-center rounded-full border text-[10px]",
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isActive
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground",
                      ].join(" ")}
                    >
                      {isDone ? "✓" : index + 1}
                    </span>
                    <span
                      className={
                        isActive || isDone
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                )
              })}
              {step === "failed" ? (
                <p className="text-[12px] text-destructive">
                  Transaction failed. Review the amount and try again.
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        <DialogFooter>
          {isFinal ? (
            <Button onClick={() => void closeDialog(false)}>Close</Button>
          ) : step === "failed" ? (
            <Button
              variant="outline"
              onClick={() => {
                setView("review")
                setStep("idle")
              }}
            >
              Review details
            </Button>
          ) : (
            <Button onClick={submit} disabled={isBusy}>
              {!address
                ? "Connect wallet"
                : isBusy
                  ? step === "signing"
                    ? "Awaiting wallet"
                    : "Processing"
                  : copy.cta}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
