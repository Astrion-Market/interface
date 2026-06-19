import { useQuery } from "@tanstack/react-query"
import { getCoreMarkets } from "../../lib/lending-contracts"
import { getIsolatedMarkets } from "../../lib/isolated-market"
import { lendingQueryKeys } from "./query-keys"
import type { Market } from "../../types/lending"

async function getAllMarkets(): Promise<Array<Market>> {
  const [isolated, core] = await Promise.allSettled([
    getIsolatedMarkets(),
    getCoreMarkets(),
  ])
  return [
    ...(isolated.status === "fulfilled" ? isolated.value : []),
    ...(core.status === "fulfilled" ? core.value : []),
  ]
}

export function useLendingMarkets() {
  return useQuery({
    queryKey: lendingQueryKeys.markets(),
    queryFn: getAllMarkets,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  })
}
