import { corePoolWrite, lendingCollateralArgs } from "./lending-write-inputs"
import { useLendingWriteMutation } from "./use-lending-write-mutation"
import type { CollateralWriteInput } from "./lending-write-inputs"
import type { WriteTransactionStep } from "../../lib/soroban"

export function useDisableCollateralMutation(
  onStep?: (step: WriteTransactionStep) => void
) {
  return useLendingWriteMutation<CollateralWriteInput>({
    mutationKey: ["lending", "write", "disable-collateral"],
    method: "disable_collateral",
    contractId: corePoolWrite.contractId,
    getUserAddress: (input) => input.userAddress,
    getMarketId: (input) => input.marketId,
    getArgs: lendingCollateralArgs,
    onStep,
    toastLabel: "Disable collateral",
  })
}
