import { useQuery } from "@tanstack/react-query"
import { getUserPortfolio } from "../../lib/portfolio-contracts"
import { lendingQueryKeys } from "./query-keys"
import type { PortfolioSummary } from "../../types/lending"

export function usePortfolioSummary(address: string | null) {
  return useQuery({
    queryKey: lendingQueryKeys.portfolioSummary(address ?? "disconnected"),
    queryFn: async (): Promise<PortfolioSummary> =>
      (await getUserPortfolio(address as string)).summary,
    enabled: Boolean(address),
    staleTime: 15_000,
  })
}
