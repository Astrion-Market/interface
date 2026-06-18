import { useQuery } from "@tanstack/react-query"
import { getUserPortfolio } from "../../lib/portfolio-contracts"
import { lendingQueryKeys } from "./query-keys"

export function useLendingPortfolio(address: string | null) {
  return useQuery({
    queryKey: lendingQueryKeys.portfolio(address ?? "disconnected"),
    queryFn: () => getUserPortfolio(address as string),
    enabled: Boolean(address),
    staleTime: 15_000,
  })
}
