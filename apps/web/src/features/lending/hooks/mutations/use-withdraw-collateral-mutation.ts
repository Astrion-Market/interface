import { withdrawCollateralArgs } from "./lending-write-inputs"
import { useLendingWriteMutation } from "./use-lending-write-mutation"
import type { MarketWriteInput } from "./lending-write-inputs"
import type { WriteTransactionStep } from "../../lib/soroban"

export function useWithdrawCollateralMutation(
  onStep?: (step: WriteTransactionStep) => void
) {
  return useLendingWriteMutation<MarketWriteInput>({
    mutationKey: ["lending", "write", "withdraw-collateral"],
    method: "withdraw_collateral",
    getContractId: (input) => input.marketAddress,
    getUserAddress: (input) => input.userAddress,
    getMarketId: (input) => input.marketId,
    getArgs: withdrawCollateralArgs,
    onStep,
    toastLabel: "Withdraw collateral",
  })
}
