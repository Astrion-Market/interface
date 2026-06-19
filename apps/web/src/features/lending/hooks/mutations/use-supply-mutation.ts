import { supplyArgs } from "./lending-write-inputs"
import { useLendingWriteMutation } from "./use-lending-write-mutation"
import type { MarketWriteInput } from "./lending-write-inputs"
import type { WriteTransactionStep } from "../../lib/soroban"

// Lend the loan asset into an isolated market (earns yield; not collateral).
export function useSupplyMutation(
  onStep?: (step: WriteTransactionStep) => void
) {
  return useLendingWriteMutation<MarketWriteInput>({
    mutationKey: ["lending", "write", "supply"],
    method: "supply",
    getContractId: (input) => input.marketAddress,
    getUserAddress: (input) => input.userAddress,
    getMarketId: (input) => input.marketId,
    getArgs: supplyArgs,
    onStep,
    toastLabel: "Lend",
  })
}
