import { useQuery } from "@tanstack/react-query"
import { getCoreMarkets } from "../../lib/lending-contracts"
import { lendingQueryKeys } from "./query-keys"

export function useLendingMarkets() {
  return useQuery({
    queryKey: lendingQueryKeys.markets(),
    queryFn: getCoreMarkets,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  })
}
