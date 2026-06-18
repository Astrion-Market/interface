"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { toast } from "sonner"
import { useTheme } from "../../ui/theme-provider"
import {
  connectStellarWallet,
  disconnectStellarWallet,
  getNativeXlmBalance,
  restoreStellarWalletAddress,
  setStellarWalletKitTheme,
} from "./stellar-wallet"
import type { ReactNode } from "react"

type WalletContextValue = {
  address: string | null
  xlmBalance: string | null
  isConnecting: boolean
  isBalanceLoading: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [address, setAddress] = useState<string | null>(null)
  const [xlmBalance, setXlmBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isBalanceLoading, setIsBalanceLoading] = useState(false)

  const refreshBalance = useCallback(async () => {
    if (!address) {
      setXlmBalance(null)
      return
    }

    setIsBalanceLoading(true)
    try {
      setXlmBalance(await getNativeXlmBalance(address))
    } catch (error) {
      toast.error("Unable to load XLM balance", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsBalanceLoading(false)
    }
  }, [address])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      const nextAddress = await connectStellarWallet()
      setAddress(nextAddress)
      toast.success("Wallet connected")
    } catch (error) {
      toast.error("Wallet connection failed", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      await disconnectStellarWallet()
    } catch (error) {
      toast.error("Wallet disconnect failed", {
        description: error instanceof Error ? error.message : undefined,
      })
      return
    }

    setAddress(null)
    setXlmBalance(null)
    toast.success("Wallet disconnected")
  }, [])

  useEffect(() => {
    let ignore = false

    async function restore() {
      const restoredAddress = await restoreStellarWalletAddress()
      if (!ignore) {
        setAddress(restoredAddress)
      }
    }

    void restore()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    void refreshBalance()
  }, [refreshBalance])

  useEffect(() => {
    void setStellarWalletKitTheme(resolvedTheme)
  }, [resolvedTheme])

  const value = useMemo(
    () => ({
      address,
      xlmBalance,
      isConnecting,
      isBalanceLoading,
      connect,
      disconnect,
      refreshBalance,
    }),
    [
      address,
      xlmBalance,
      isConnecting,
      isBalanceLoading,
      connect,
      disconnect,
      refreshBalance,
    ]
  )

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export function useWallet() {
  const wallet = useContext(WalletContext)

  if (!wallet) {
    throw new Error("useWallet must be used inside WalletProvider")
  }

  return wallet
}
