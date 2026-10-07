export type FaucetAssetSymbol = "USDC" | "WBTC"

export type FaucetResult = {
  hash: string | null
  amount: string
  asset: FaucetAssetSymbol
  explorerUrl: string | null
  rawOutput: string
}

// Client side of the testnet faucet: posts to the /api/faucet resource route.
export async function requestDrip(address: string, asset: FaucetAssetSymbol): Promise<FaucetResult> {
  const response = await fetch("/api/faucet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, asset }),
  })
  const body = (await response.json()) as FaucetResult | { error: string }
  if (!response.ok || "error" in body) throw new Error("error" in body ? body.error : "Faucet request failed")
  return body
}
