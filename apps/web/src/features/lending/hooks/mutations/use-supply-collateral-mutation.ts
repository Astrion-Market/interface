import { supplyCollateralArgs } from "./lending-write-inputs"
import { useLendingWriteMutation } from "./use-lending-write-mutation"
import type { MarketWriteInput } from "./lending-write-inputs"
import type { WriteTransactionStep } from "../../lib/soroban"

export function useSupplyCollateralMutation(
  onStep?: (step: WriteTransactionStep) => void
) {
  return useLendingWriteMutation<MarketWriteInput>({
    mutationKey: ["lending", "write", "supply-collateral"],
    method: "supply_collateral",
    getContractId: (input) => input.marketAddress,
    getUserAddress: (input) => input.userAddress,
    getMarketId: (input) => input.marketId,
    getArgs: supplyCollateralArgs,
    onStep,
    toastLabel: "Add collateral",
  })
}
