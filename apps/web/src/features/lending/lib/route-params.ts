import { isExecutionChainId, isProtocolId } from "./identity"
import type { ExecutionChainId, ProtocolId } from "./identity"

export type MarketFilter = "all" | "isolated"

export type MarketSearch = {
  // Existing Stellar markets. `type=isolated` links from before the revamp
  // still land here with the isolated filter applied.
  venue?: "stellar"
  type?: "isolated"
  chain?: ExecutionChainId
  protocol?: ProtocolId
  action?: "lend" | "borrow"
  sort?: "lend-rate" | "borrow-rate" | "liquidity"
}

export function parseMarketSearch(search: Record<string, unknown>): MarketSearch {
  const result: MarketSearch = {}
  if (search.type === "isolated") result.type = "isolated"
  if (search.venue === "stellar" || result.type) result.venue = "stellar"
  if (typeof search.chain === "string" && isExecutionChainId(search.chain)) result.chain = search.chain
  if (typeof search.protocol === "string" && isProtocolId(search.protocol)) result.protocol = search.protocol
  if (search.action === "lend" || search.action === "borrow") result.action = search.action
  if (search.sort === "lend-rate" || search.sort === "borrow-rate" || search.sort === "liquidity")
    result.sort = search.sort
  return result
}

// Syntactic validation only. A future verified registry must resolve these IDs
// before any protocol reader or transaction builder uses them.
export function isSupportedDetailRoute(
  chain: string,
  protocol: string,
  id: string,
  kind: "market" | "position"
) {
  if (!isExecutionChainId(chain) || !isProtocolId(protocol)) return false
  if (kind === "position") return /^[a-zA-Z0-9_-]{1,128}$/.test(id)
  return protocol === "morpho-blue"
    ? /^0x[\da-fA-F]{64}$/.test(id)
    : /^0x[\da-fA-F]{40}$/.test(id)
}
