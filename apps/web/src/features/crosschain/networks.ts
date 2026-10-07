// Network registry for cross-chain routes. Values are from public Circle and
// chain documentation and are NOT yet verified against C05 manifests; route
// writes stay disabled until they are.

import type { ExecutionChainId } from "../lending/lib/identity"
import type { Address } from "./model"

export type NetworkEnv = "testnet" | "mainnet"

export type EvmNetwork = {
  chainId: number
  name: string
  explorer: string
  // Circle-issued native USDC: the only asset CCTP routes may carry.
  usdc: Address
  // Bridged USDC variants that must never be treated as native USDC.
  lookalikes: Array<{ symbol: string; address: Address }>
  cctpDomain: number
}

export type StellarNetwork = {
  passphrase: string
  label: string
  horizon: string
  explorer: string
  usdc: { code: "USDC"; issuer: string }
}

export const EVM_NETWORKS: Record<NetworkEnv, Record<ExecutionChainId, EvmNetwork>> = {
  testnet: {
    base: {
      chainId: 84532,
      name: "Base Sepolia",
      explorer: "https://sepolia.basescan.org",
      usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      lookalikes: [],
      cctpDomain: 6,
    },
    ethereum: {
      chainId: 11155111,
      name: "Ethereum Sepolia",
      explorer: "https://sepolia.etherscan.io",
      usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      lookalikes: [],
      cctpDomain: 0,
    },
  },
  mainnet: {
    base: {
      chainId: 8453,
      name: "Base",
      explorer: "https://basescan.org",
      usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      lookalikes: [{ symbol: "USDbC", address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA" }],
      cctpDomain: 6,
    },
    ethereum: {
      chainId: 1,
      name: "Ethereum",
      explorer: "https://etherscan.io",
      usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      lookalikes: [],
      cctpDomain: 0,
    },
  },
}

export const STELLAR_NETWORKS: Record<NetworkEnv, StellarNetwork> = {
  testnet: {
    passphrase: "Test SDF Network ; September 2015",
    label: "Stellar Testnet",
    horizon: "https://horizon-testnet.stellar.org",
    explorer: "https://stellar.expert/explorer/testnet",
    usdc: { code: "USDC", issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" },
  },
  mainnet: {
    passphrase: "Public Global Stellar Network ; September 2015",
    label: "Stellar Mainnet",
    horizon: "https://horizon.stellar.org",
    explorer: "https://stellar.expert/explorer/public",
    usdc: { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
  },
}

export function evmNetworkByChainId(chainId: number):
  | { env: NetworkEnv; chain: ExecutionChainId; network: EvmNetwork }
  | undefined {
  for (const env of ["testnet", "mainnet"] as const)
    for (const chain of ["base", "ethereum"] as const) {
      const network = EVM_NETWORKS[env][chain]
      if (network.chainId === chainId) return { env, chain, network }
    }
  return undefined
}

export function explorerTxUrl(env: NetworkEnv, chain: ExecutionChainId | "stellar", hash: string) {
  return chain === "stellar"
    ? `${STELLAR_NETWORKS[env].explorer}/tx/${hash}`
    : `${EVM_NETWORKS[env][chain].explorer}/tx/${hash}`
}
