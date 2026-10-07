import { SOROBAN_NETWORK_PASSPHRASE } from "./astrion-contracts"

// Fail closed for custom networks: the existing faucet only targets testnet.
export const IS_STELLAR_TESTNET =
  SOROBAN_NETWORK_PASSPHRASE === "Test SDF Network ; September 2015"

export const STELLAR_NETWORK_LABEL = IS_STELLAR_TESTNET
  ? "Stellar Testnet"
  : SOROBAN_NETWORK_PASSPHRASE ===
      "Public Global Stellar Network ; September 2015"
    ? "Stellar Mainnet"
    : "Custom Stellar network"
