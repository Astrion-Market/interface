import { borrowArgs } from "./lending-write-inputs"
import { useLendingWriteMutation } from "./use-lending-write-mutation"
import type { MarketWriteInput } from "./lending-write-inputs"
import type { WriteTransactionStep } from "../../lib/soroban"

export function useBorrowMutation(
  onStep?: (step: WriteTransactionStep) => void
) {
  return useLendingWriteMutation<MarketWriteInput>({
    mutationKey: ["lending", "write", "borrow"],
    method: "borrow",
    getContractId: (input) => input.marketAddress,
    getUserAddress: (input) => input.userAddress,
    getMarketId: (input) => input.marketId,
    getArgs: borrowArgs,
    onStep,
    toastLabel: "Borrow",
  })
}
