import { useQuery } from "@tanstack/react-query"
import { getStellarUsdcStatus, getStellarWalletPassphrase } from "../wallet/stellar-wallet"
import { useEvmWallet } from "../wallet/evm/evm-wallet-provider"
import { useWallet } from "../wallet/wallet-provider"
import { toChainId } from "../wallet/evm/evm-session"
import { ROUTE_ENV, ROUTE_EVM_NETWORKS, ROUTE_STELLAR_NETWORK } from "./env"
import { crosschainQueryKeys } from "./query-keys"
import type { ExecutionChainId } from "../lending/lib/identity"
import type { PreflightInput } from "./preflight"

// Live inputs for the route checks. Every read is keyed by environment and
// both wallet identities; anything not readable stays null (unknown).
export function useRouteReadiness(chain: ExecutionChainId): Pick<
  PreflightInput,
  "stellar" | "evm" | "executionAccount" | "gasSponsorship"
> & { refetch: () => void } {
  const stellar = useWallet()
  const evm = useEvmWallet()
  const owner = { stellar: stellar.address, evm: evm.session.account }
  const accountKey = crosschainQueryKeys.account(ROUTE_ENV, owner)
  const targetChainId = ROUTE_EVM_NETWORKS[chain].chainId

  const usdc = useQuery({
    queryKey: [...accountKey, "stellar-usdc"],
    enabled: !!stellar.address,
    queryFn: () =>
      getStellarUsdcStatus(ROUTE_STELLAR_NETWORK.horizon, stellar.address!, ROUTE_STELLAR_NETWORK.usdc.issuer),
    staleTime: 15_000,
  })

  const passphrase = useQuery({
    queryKey: [...accountKey, "stellar-network"],
    enabled: !!stellar.address,
    queryFn: getStellarWalletPassphrase,
    staleTime: 15_000,
  })

  // Only read gas on the chain the route needs; elsewhere the balance is meaningless.
  const onTarget = evm.session.chainId === targetChainId
  const gas = useQuery({
    queryKey: [...accountKey, "evm-native", targetChainId],
    enabled: !!evm.provider && !!evm.session.account && onTarget,
    queryFn: async () => {
      const hex = await evm.provider!.request({ method: "eth_getBalance", params: [evm.session.account, "latest"] })
      const parsed = typeof hex === "string" ? BigInt(hex) : null
      // Guard against a chain switch racing the read.
      const chainNow = toChainId(await evm.provider!.request({ method: "eth_chainId" }))
      return chainNow === targetChainId ? parsed : null
    },
    staleTime: 15_000,
  })

  return {
    stellar: {
      address: stellar.address,
      walletPassphrase: passphrase.data ?? null,
      usdcBalance: usdc.data ? usdc.data.balanceRaw : null,
      hasUsdcTrustline: usdc.data ? usdc.data.hasTrustline : null,
    },
    evm: {
      address: evm.session.account,
      chainId: evm.session.chainId,
      nativeBalance: onTarget ? (gas.data ?? null) : null,
    },
    // Execution-account discovery (C08) and sponsorship policy don't exist yet.
    executionAccount: { deployed: null },
    gasSponsorship: { available: null },
    refetch: () => {
      void usdc.refetch()
      void passphrase.refetch()
      void gas.refetch()
    },
  }
}
