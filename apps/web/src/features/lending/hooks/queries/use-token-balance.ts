import { useQuery } from "@tanstack/react-query"
import { TOKEN_BY_CONTRACT } from "../../lib/astrion-contracts"
import { formatTokenAmount } from "../../lib/stellar-format"
import { addressArg, callReadContract } from "../../lib/soroban"
import { lendingQueryKeys } from "./query-keys"

type TokenBalance = {
  raw: bigint
  formatted: string
}

export function useTokenBalance(address: string | null, tokenId: string) {
  const token = TOKEN_BY_CONTRACT[tokenId]

  return useQuery({
    queryKey: lendingQueryKeys.tokenBalance(address ?? "disconnected", tokenId),
    queryFn: async (): Promise<TokenBalance> => {
      if (!token) {
        throw new Error("Unsupported token")
      }

      const raw = await callReadContract<bigint>(tokenId, "balance", [
        addressArg(address!),
      ])

      return {
        raw,
        formatted: formatTokenAmount(raw, token.decimals, token.symbol),
      }
    },
    enabled: Boolean(address && token),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  })
}
