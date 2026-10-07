import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { SUPPORTED_EVM_CHAIN_IDS } from "../../crosschain/env"
import { evmNetworkByChainId } from "../../crosschain/networks"
import { discoverWallets } from "./eip6963"
import { INITIAL_EVM_SESSION, evmSessionReducer, toChainId } from "./evm-session"
import type { ReactNode } from "react"
import type { DiscoveredWallet, Eip1193Provider } from "./eip6963"
import type { EvmSession } from "./evm-session"

const STORED_WALLET_KEY = "astrion.evm.wallet"

type EvmWalletContextValue = {
  session: EvmSession
  wallets: Array<DiscoveredWallet>
  networkName: string | null
  isSupportedChain: boolean
  connect: (rdns: string) => Promise<void>
  disconnect: () => Promise<void>
  switchChain: (chainId: number) => Promise<void>
  dismiss: () => void
  provider: Eip1193Provider | null
}

const EvmWalletContext = createContext<EvmWalletContextValue | null>(null)

function readStored() {
  try {
    return localStorage.getItem(STORED_WALLET_KEY)
  } catch {
    return null
  }
}

function writeStored(value: string | null) {
  try {
    if (value) localStorage.setItem(STORED_WALLET_KEY, value)
    else localStorage.removeItem(STORED_WALLET_KEY)
  } catch {
    /* storage unavailable: session simply won't restore */
  }
}

export function EvmWalletProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(evmSessionReducer, INITIAL_EVM_SESSION)
  const [wallets, setWallets] = useState<Array<DiscoveredWallet>>([])
  const restoreAttempted = useRef(false)

  useEffect(() => discoverWallets(setWallets), [])

  const active = wallets.find((w) => w.info.rdns === session.providerId) ?? null
  const provider = active?.provider ?? null

  const readSession = useCallback(async (wallet: DiscoveredWallet, method: "eth_accounts" | "eth_requestAccounts") => {
    const accounts = (await wallet.provider.request({ method })) as Array<string>
    const chainId = toChainId(await wallet.provider.request({ method: "eth_chainId" }))
    return { account: accounts.at(0) ?? null, chainId }
  }, [])

  // Restore silently (eth_accounts never prompts) when the remembered wallet announces itself.
  useEffect(() => {
    if (restoreAttempted.current) return
    const stored = readStored()
    if (!stored) return
    const wallet = wallets.find((w) => w.info.rdns === stored)
    if (!wallet) return
    restoreAttempted.current = true
    readSession(wallet, "eth_accounts")
      .then(({ account, chainId }) => {
        if (account && chainId !== null) dispatch({ type: "connected", providerId: stored, account, chainId })
        else {
          writeStored(null)
          dispatch({ type: "restore-empty" })
        }
      })
      .catch(() => dispatch({ type: "restore-empty" }))
  }, [wallets, readSession])

  // Follow wallet-side changes for the active provider.
  useEffect(() => {
    if (!provider?.on) return
    const onAccounts = (accounts: Array<string>) => {
      dispatch({ type: "accounts-changed", accounts })
      if (accounts.length === 0) writeStored(null)
    }
    const onChain = (value: unknown) => {
      const chainId = toChainId(value)
      if (chainId !== null) dispatch({ type: "chain-changed", chainId })
    }
    const onDisconnect = () => dispatch({ type: "provider-disconnected" })
    provider.on("accountsChanged", onAccounts)
    provider.on("chainChanged", onChain)
    provider.on("disconnect", onDisconnect)
    return () => {
      provider.removeListener?.("accountsChanged", onAccounts)
      provider.removeListener?.("chainChanged", onChain)
      provider.removeListener?.("disconnect", onDisconnect)
    }
  }, [provider])

  const connect = useCallback(
    async (rdns: string) => {
      const wallet = wallets.find((w) => w.info.rdns === rdns)
      if (!wallet) {
        dispatch({ type: "failed", error: new Error("That wallet is no longer available in this browser.") })
        return
      }
      dispatch({ type: "connect-start", providerId: rdns })
      try {
        const { account, chainId } = await readSession(wallet, "eth_requestAccounts")
        if (!account || chainId === null) throw new Error("The wallet returned no account.")
        writeStored(rdns)
        dispatch({ type: "connected", providerId: rdns, account, chainId })
      } catch (error) {
        dispatch({ type: "failed", error })
      }
    },
    [wallets, readSession]
  )

  const disconnect = useCallback(async () => {
    writeStored(null)
    // Not every wallet supports revoking; the local session ends either way.
    await provider?.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] }).catch(() => undefined)
    dispatch({ type: "user-disconnected" })
  }, [provider])

  const switchChain = useCallback(
    async (chainId: number) => {
      if (!provider) return
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        })
      } catch (error) {
        dispatch({ type: "failed", error })
      }
    },
    [provider]
  )

  const value = useMemo<EvmWalletContextValue>(() => {
    const known = session.chainId === null ? undefined : evmNetworkByChainId(session.chainId)
    return {
      session,
      wallets,
      networkName: known?.network.name ?? (session.chainId === null ? null : `Chain ${session.chainId}`),
      isSupportedChain: session.chainId !== null && SUPPORTED_EVM_CHAIN_IDS.includes(session.chainId),
      connect,
      disconnect,
      switchChain,
      dismiss: () => dispatch({ type: "dismiss" }),
      provider,
    }
  }, [session, wallets, connect, disconnect, switchChain, provider])

  return <EvmWalletContext.Provider value={value}>{children}</EvmWalletContext.Provider>
}

export function useEvmWallet() {
  const value = useContext(EvmWalletContext)
  if (!value) throw new Error("useEvmWallet must be used inside EvmWalletProvider")
  return value
}
