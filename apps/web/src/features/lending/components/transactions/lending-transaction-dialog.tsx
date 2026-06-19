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
import { useSupplyCollateralMutation } from "../../hooks/mutations/use-supply-collateral-mutation"
import { useWithdrawMutation } from "../../hooks/mutations/use-withdraw-mutation"
import { useWithdrawCollateralMutation } from "../../hooks/mutations/use-withdraw-collateral-mutation"
import { useLendingMarkets } from "../../hooks/queries/use-lending-markets"
import { useIsolatedPosition } from "../../hooks/queries/use-isolated-position"
import { lendingQueryKeys } from "../../hooks/queries/query-keys"
import { useTokenBalance } from "../../hooks/queries/use-token-balance"
import {
  formatUsd,
  tokenAmountToNumber,
  wadToNumber,
} from "../../lib/stellar-format"
import type { WriteTransactionStep } from "../../lib/soroban"
import type { Market } from "../../types/lending"

export type LendingAction =
  | "supply"
  | "withdraw"
  | "borrow"
  | "repay"
  | "supply_collateral"
  | "withdraw_collateral"

type Props = {
  action: LendingAction
  market: Pick<
    Market,
    | "id"
    | "symbol"
    | "name"
    | "loanAsset"
    | "collateralAsset"
    | "loanSymbol"
    | "collateralSymbol"
  >
  open: boolean
  onOpenChange: (open: boolean) => void
}

type DialogView = "review" | "progress"

const actionCopy: Record<LendingAction, { title: string; cta: string }> = {
  supply: { title: "Lend asset", cta: "Confirm lend" },
  withdraw: { title: "Withdraw lent asset", cta: "Confirm withdraw" },
  borrow: { title: "Borrow asset", cta: "Confirm borrow" },
  repay: { title: "Repay debt", cta: "Confirm repay" },
  supply_collateral: { title: "Add collateral", cta: "Confirm collateral" },
  withdraw_collateral: {
    title: "Withdraw collateral",
    cta: "Confirm withdraw",
  },
}

const actionVerb: Record<LendingAction, string> = {
  supply: "Lending",
  withdraw: "Withdrawing",
  borrow: "Borrowing",
  repay: "Repaying",
  supply_collateral: "Adding collateral",
  withdraw_collateral: "Withdrawing collateral",
}

const collateralActions: ReadonlySet<LendingAction> = new Set<LendingAction>([
  "supply_collateral",
  "withdraw_collateral",
])

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

// Exact raw -> decimal string (no float rounding) for prefilling the amount.
function rawToAmountString(raw: bigint, decimals: number) {
  if (raw <= 0n) return ""
  const padded = raw.toString().padStart(decimals + 1, "0")
  const whole = padded.slice(0, padded.length - decimals)
  const frac = padded.slice(padded.length - decimals).replace(/0+$/, "")
  return frac ? `${whole}.${frac}` : whole
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
  // For a max withdraw/repay we submit by SHARES (not assets) so interest
  // accruing between quote and submit can't leave dust behind.
  const [useShares, setUseShares] = useState(false)
  const [view, setView] = useState<DialogView>("review")
  const [step, setStep] = useState<WriteTransactionStep>("idle")
  const currentStep = stepIndex(step)
  // Resolve which token this action moves: collateral asset for collateral
  // actions, loan asset otherwise. Legacy core markets fall back to market.id.
  const isCollateralAction = collateralActions.has(action)
  const tokenContract = isCollateralAction
    ? (market.collateralAsset ?? market.id)
    : (market.loanAsset ?? market.id)
  const tokenSymbol =
    (isCollateralAction ? market.collateralSymbol : market.loanSymbol) ??
    market.symbol
  const token = TOKEN_BY_CONTRACT[tokenContract]
  const {
    data: balance,
    error: balanceError,
    isFetching: isBalanceFetching,
  } = useTokenBalance(address, tokenContract)
  const { data: markets } = useLendingMarkets()
  const { data: account, isFetching: isAccountFetching } = useIsolatedPosition(
    address,
    market.id
  )
  const supply = useSupplyMutation(setStep)
  const withdraw = useWithdrawMutation(setStep)
  const borrow = useBorrowMutation(setStep)
  const repay = useRepayMutation(setStep)
  const supplyCollateral = useSupplyCollateralMutation(setStep)
  const withdrawCollateral = useWithdrawCollateralMutation(setStep)
  const mutation = {
    supply,
    withdraw,
    borrow,
    repay,
    supply_collateral: supplyCollateral,
    withdraw_collateral: withdrawCollateral,
  }[action]
  const copy = actionCopy[action]
  const isFinal = step === "confirmed"
  const isBusy = mutation.isPending || isConnecting
  const activeMarket = markets?.find((item) => item.id === market.id)
  // Price (USD) of the token this action moves. Borrow/lend use the loan asset,
  // collateral actions use the collateral asset — they are different assets, so
  // the market-row oracle price (collateral) is only a fallback for display.
  const movedTokenPrice = account
    ? wadToNumber(
        isCollateralAction ? account.collateralPriceWad : account.loanPriceWad
      )
    : (activeMarket?.oraclePrice ?? 0)
  const amountNumber = Number(amount)
  const amountValueUsd =
    Number.isFinite(amountNumber) && amountNumber > 0
      ? amountNumber * movedTokenPrice
      : 0

  // Per-market borrow capacity / health. In Morpho health = collateral_value *
  // lltv / debt_value, valuing each leg by its own oracle price.
  const lltvFraction = (account?.lltv ?? activeMarket?.lltv ?? 0) / 100
  const collateralUsd = account
    ? tokenAmountToNumber(
        account.position.collateralRaw,
        account.collateralDecimals
      ) * wadToNumber(account.collateralPriceWad)
    : 0
  const debtUsd = account
    ? tokenAmountToNumber(account.position.borrowedRaw, account.loanDecimals) *
      wadToNumber(account.loanPriceWad)
    : 0
  const maxBorrowUsd = collateralUsd * lltvFraction
  const availableUsd = Math.max(0, maxBorrowUsd - debtUsd)
  const currentHealthFactor = account?.position.healthFactor ?? null
  const borrowValueUsd = action === "borrow" ? amountValueUsd : 0
  const projectedDebtUsd = debtUsd + borrowValueUsd
  const projectedAvailableUsd = Math.max(0, maxBorrowUsd - projectedDebtUsd)
  const projectedHealthFactor =
    projectedDebtUsd > 0 ? maxBorrowUsd / projectedDebtUsd : null

  // The full amount the user can apply for this action, and whether a "max"
  // submits by shares (withdraw/repay) to avoid interest-accrual dust.
  const maxConfig = (() => {
    const pos = account?.position
    switch (action) {
      case "withdraw":
        return pos && account
          ? { raw: pos.suppliedRaw, decimals: account.loanDecimals, shares: true }
          : null
      case "repay":
        return pos && account
          ? { raw: pos.borrowedRaw, decimals: account.loanDecimals, shares: true }
          : null
      case "withdraw_collateral":
        return pos && account
          ? {
              raw: pos.collateralRaw,
              decimals: account.collateralDecimals,
              shares: false,
            }
          : null
      case "supply":
      case "supply_collateral":
        return balance && token
          ? { raw: balance.raw, decimals: token.decimals, shares: false }
          : null
      default:
        return null
    }
  })()

  function applyMax() {
    if (!maxConfig) return
    setAmount(rawToAmountString(maxConfig.raw, maxConfig.decimals))
    setUseShares(maxConfig.shares)
  }

  function changeAmount(next: string) {
    setAmount(next)
    // Any manual edit invalidates a by-shares max.
    if (useShares) setUseShares(false)
  }

  const formattedAmount =
    amountNumber > 0 && Number.isFinite(amountNumber)
      ? `${amount} ${tokenSymbol}`
      : `0 ${tokenSymbol}`
  const formattedAmountValue =
    movedTokenPrice > 0 ? formatUsd(amountValueUsd) : "USD value unavailable"
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
    setUseShares(false)
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

    // A by-shares max passes the position's shares so the contract burns the
    // exact outstanding amount (assets is ignored when shares are set).
    const maxShares =
      useShares && account
        ? action === "withdraw"
          ? account.position.supplyShares
          : action === "repay"
            ? account.position.borrowShares
            : undefined
        : undefined

    setView("progress")
    mutation.mutate({
      userAddress: address,
      marketAddress: market.id,
      marketId: market.id,
      tokenContract,
      amount,
      maxShares,
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
                        : (balance?.formatted ?? `0 ${tokenSymbol}`)
                    : "Connect wallet"}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  disabled={isBusy || isFinal}
                  onChange={(event) => changeAmount(event.target.value)}
                />
                {maxConfig && maxConfig.raw > 0n ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy || isFinal}
                    onClick={applyMax}
                  >
                    Max
                  </Button>
                ) : null}
                <span className="min-w-12 text-right text-[12px] font-medium text-muted-foreground">
                  {tokenSymbol}
                </span>
              </div>
              {action === "borrow" ? (
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {movedTokenPrice > 0
                    ? `${formatUsd(amountValueUsd)} at ${formatUsd(movedTokenPrice)} / ${tokenSymbol}`
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
                value: isAccountFetching
                  ? "Loading"
                  : formatHealthFactor(currentHealthFactor),
              },
              {
                id: "projected-health-factor",
                label: "After Borrow",
                value: isAccountFetching
                  ? "Loading"
                  : formatHealthFactor(projectedHealthFactor),
                accent:
                  projectedHealthFactor !== null &&
                  projectedHealthFactor < 1.5,
              },
              {
                id: "available-to-borrow",
                label: "Available",
                value: isAccountFetching
                  ? "Loading"
                  : formatUsd(availableUsd),
              },
              {
                id: "projected-available",
                label: "After Borrow",
                value: isAccountFetching
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
                value: isAccountFetching
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
                      {formatHealthFactor(currentHealthFactor)}
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
