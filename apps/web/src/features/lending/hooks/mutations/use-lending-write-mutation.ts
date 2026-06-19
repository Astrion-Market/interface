import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { signStellarTransaction } from "../../../wallet/stellar-wallet"
import { sendWriteContract } from "../../lib/soroban"
import { lendingQueryKeys } from "../queries/query-keys"
import type {
  WriteTransactionResult,
  WriteTransactionStep,
} from "../../lib/soroban"
import type { xdr } from "@stellar/stellar-sdk"

type UseLendingWriteMutationOptions<TInput> = {
  mutationKey: ReadonlyArray<string>
  method: string
  // Static contract (legacy CorePool hooks) ...
  contractId?: string
  // ... or resolved per-input. In Morpho this is the market CONTRACT address,
  // not a shared pool. Exactly one of `contractId` / `getContractId` is set.
  getContractId?: (input: TInput) => string
  getUserAddress: (input: TInput) => string
  getMarketId?: (input: TInput) => string
  getArgs: (input: TInput) => Array<xdr.ScVal>
  onStep?: (step: WriteTransactionStep) => void
  toastLabel: string
}

export function useLendingWriteMutation<TInput>({
  mutationKey,
  method,
  contractId,
  getContractId,
  getUserAddress,
  getMarketId,
  getArgs,
  onStep,
  toastLabel,
}: UseLendingWriteMutationOptions<TInput>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey,
    mutationFn: async (input: TInput) => {
      const userAddress = getUserAddress(input)
      if (!userAddress) {
        throw new Error("Connect your wallet first")
      }

      const target = getContractId?.(input) ?? contractId
      if (!target) {
        throw new Error("No contract target for write")
      }

      return sendWriteContract({
        sourceAddress: userAddress,
        contractId: target,
        method,
        args: getArgs(input),
        signTransaction: (xdr) => signStellarTransaction(xdr, userAddress),
        onStep,
      })
    },
    onSuccess: async (result: WriteTransactionResult, input) => {
      const userAddress = getUserAddress(input)
      const marketId = getMarketId?.(input)

      toast.success(`${toastLabel} confirmed`, {
        description: `Tx ${result.hash.slice(0, 10)}...${result.hash.slice(-8)}`,
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: lendingQueryKeys.markets() }),
        marketId
          ? queryClient.invalidateQueries({
              queryKey: lendingQueryKeys.market(marketId),
            })
          : Promise.resolve(),
        queryClient.invalidateQueries({
          queryKey: lendingQueryKeys.account(userAddress),
        }),
      ])
    },
    onError: (error) => {
      onStep?.("failed")
      toast.error(`${toastLabel} failed`, {
        description: error instanceof Error ? error.message : undefined,
      })
    },
  })
}
