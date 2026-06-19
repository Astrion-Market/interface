import { withdrawArgs } from "./lending-write-inputs"
import { useLendingWriteMutation } from "./use-lending-write-mutation"
import type { MarketWriteInput } from "./lending-write-inputs"
import type { WriteTransactionStep } from "../../lib/soroban"

export function useWithdrawMutation(
  onStep?: (step: WriteTransactionStep) => void
) {
  return useLendingWriteMutation<MarketWriteInput>({
    mutationKey: ["lending", "write", "withdraw"],
    method: "withdraw",
    getContractId: (input) => input.marketAddress,
    getUserAddress: (input) => input.userAddress,
    getMarketId: (input) => input.marketId,
    getArgs: withdrawArgs,
    onStep,
    toastLabel: "Withdraw",
  })
}
