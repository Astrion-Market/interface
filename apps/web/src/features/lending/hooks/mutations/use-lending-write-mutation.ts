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
  contractId: string
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

      return sendWriteContract({
        sourceAddress: userAddress,
        contractId,
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
