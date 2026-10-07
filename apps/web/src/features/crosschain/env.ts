import { IS_STELLAR_TESTNET } from "../lending/lib/network"
import { EVM_NETWORKS, STELLAR_NETWORKS } from "./networks"
import type { NetworkEnv } from "./networks"

// Cross-chain routes follow the configured Stellar network so a testnet build
// can never resolve a mainnet route, and the reverse.
export const ROUTE_ENV: NetworkEnv = IS_STELLAR_TESTNET ? "testnet" : "mainnet"
export const ROUTE_EVM_NETWORKS = EVM_NETWORKS[ROUTE_ENV]
export const ROUTE_STELLAR_NETWORK = STELLAR_NETWORKS[ROUTE_ENV]
export const SUPPORTED_EVM_CHAIN_IDS = Object.values(ROUTE_EVM_NETWORKS).map((n) => n.chainId)
