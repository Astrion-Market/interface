export type MarketFilter = "all" | "isolated"

export function parseMarketSearch(search: Record<string, unknown>): {
  type?: "isolated"
} {
  return search.type === "isolated" ? { type: "isolated" } : {}
}

// Syntactic validation only. A future verified registry must resolve these IDs
// before any protocol reader or transaction builder uses them.
export function isSupportedDetailRoute(
  chain: string,
  protocol: string,
  id: string,
  kind: "market" | "position"
) {
  if (chain !== "base" && chain !== "ethereum") return false
  if (!["aave-v3", "morpho-blue", "compound-v3"].includes(protocol))
    return false
  if (kind === "position") return /^[a-zA-Z0-9_-]{1,128}$/.test(id)
  return protocol === "morpho-blue"
    ? /^0x[\da-fA-F]{64}$/.test(id)
    : /^0x[\da-fA-F]{40}$/.test(id)
}
