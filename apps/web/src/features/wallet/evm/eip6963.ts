// EIP-6963 multi-wallet discovery plus the EIP-1193 provider surface Astrion
// uses. No third-party connector: injected wallets announce themselves.

export type Eip1193Provider = {
  request: (args: { method: string; params?: Array<unknown> | Record<string, unknown> }) => Promise<unknown>
  on?: (event: string, listener: (...args: Array<any>) => void) => void
  removeListener?: (event: string, listener: (...args: Array<any>) => void) => void
}

export type WalletInfo = {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export type DiscoveredWallet = { info: WalletInfo; provider: Eip1193Provider }

type AnnounceEvent = CustomEvent<DiscoveredWallet>

export function discoverWallets(onChange: (wallets: Array<DiscoveredWallet>) => void): () => void {
  const byRdns = new Map<string, DiscoveredWallet>()
  const handle = (event: Event) => {
    const detail = (event as AnnounceEvent).detail as DiscoveredWallet | undefined
    if (!detail?.info.rdns) return
    byRdns.set(detail.info.rdns, detail)
    onChange([...byRdns.values()])
  }
  window.addEventListener("eip6963:announceProvider", handle)
  window.dispatchEvent(new Event("eip6963:requestProvider"))
  return () => window.removeEventListener("eip6963:announceProvider", handle)
}
