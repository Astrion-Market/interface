import { corePoolWrite, lendingAmountArgs } from "./lending-write-inputs"
import { useLendingWriteMutation } from "./use-lending-write-mutation"
import type { LendingWriteInput } from "./lending-write-inputs"
import type { WriteTransactionStep } from "../../lib/soroban"

export function useRepayMutation(
  onStep?: (step: WriteTransactionStep) => void
) {
  return useLendingWriteMutation<LendingWriteInput>({
    mutationKey: ["lending", "write", "repay"],
    method: "repay",
    contractId: corePoolWrite.contractId,
    getUserAddress: (input) => input.userAddress,
    getMarketId: (input) => input.marketId,
    getArgs: lendingAmountArgs,
    onStep,
    toastLabel: "Repay",
  })
}
