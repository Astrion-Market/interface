export const lendingQueryKeys = {
  all: ["lending"] as const,
  markets: () => [...lendingQueryKeys.all, "markets"] as const,
  market: (marketId: string) =>
    [...lendingQueryKeys.markets(), marketId] as const,
  account: (address: string) =>
    [...lendingQueryKeys.all, "account", address] as const,
  tokenBalance: (address: string, tokenId: string) =>
    [...lendingQueryKeys.account(address), "token-balance", tokenId] as const,
  positions: (address: string) =>
    [...lendingQueryKeys.account(address), "positions"] as const,
  portfolio: (address: string) =>
    [...lendingQueryKeys.account(address), "portfolio"] as const,
  portfolioSummary: (address: string) =>
    [...lendingQueryKeys.account(address), "portfolio-summary"] as const,
  isolatedPosition: (address: string, marketId: string) =>
    [
      ...lendingQueryKeys.account(address),
      "isolated-position",
      marketId,
    ] as const,
}
