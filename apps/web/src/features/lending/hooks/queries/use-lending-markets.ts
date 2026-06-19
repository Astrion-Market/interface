import { useQuery } from "@tanstack/react-query"
import { getIsolatedMarkets } from "../../lib/isolated-market"
import { lendingQueryKeys } from "./query-keys"

export function useLendingMarkets() {
  return useQuery({
    queryKey: lendingQueryKeys.markets(),
    queryFn: getIsolatedMarkets,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  })
}
