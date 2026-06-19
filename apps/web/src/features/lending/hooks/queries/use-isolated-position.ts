import { useQuery } from "@tanstack/react-query"
import { getIsolatedAccount } from "../../lib/isolated-market"
import { lendingQueryKeys } from "./query-keys"

/**
 * A user's position in a single isolated market plus the prices/params needed
 * for per-market health and borrow-capacity math. Returns `null` when the user
 * has no position (or the market is not an isolated market).
 */
export function useIsolatedPosition(
  address: string | null,
  marketId: string | null
) {
  return useQuery({
    queryKey: lendingQueryKeys.isolatedPosition(
      address ?? "disconnected",
      marketId ?? "none"
    ),
    queryFn: () => getIsolatedAccount(marketId as string, address as string),
    enabled: Boolean(address && marketId),
    staleTime: 15_000,
  })
}
