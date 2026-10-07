import { useQuery } from "@tanstack/react-query"
import { parseMarketFixture } from "./fixture-client"
import { crosschainQueryKeys } from "./query-keys"

// Fixture-backed until C05 manifests and C16 readers exist. Swap the queryFn
// for the SDK reader; the key already carries the environment.
export function useCrosschainMarkets() {
  return useQuery({
    queryKey: crosschainQueryKeys.markets("fixture"),
    queryFn: async () => {
      const { default: raw } = await import("./fixtures/markets.preview.json")
      return parseMarketFixture(raw)
    },
    staleTime: Infinity,
  })
}
