import { Address } from "@stellar/stellar-sdk"
import { TOKENS } from "../../lending/lib/astrion-contracts"
import { IS_STELLAR_TESTNET } from "../../lending/lib/network"

import type { FaucetAssetSymbol, FaucetResult } from "./usdc-faucet"

const FAUCET_ASSETS: Record<
  FaucetAssetSymbol,
  {
    amount: string
    contractId: string
    decimals: number
    displayAmount: string
  }
> = {
  USDC: {
    amount: "1000",
    contractId: TOKENS.USDC.contractId,
    decimals: TOKENS.USDC.decimals,
    displayAmount: "1,000 USDC",
  },
  WBTC: {
    amount: "0.01",
    contractId: TOKENS.WBTC.contractId,
    decimals: TOKENS.WBTC.decimals,
    displayAmount: "0.01 WBTC",
  },
}

function assertValidAccount(address: unknown): string {
  if (typeof address !== "string") {
    throw new Error("Wallet address is required")
  }

  try {
    Address.fromString(address)
  } catch {
    throw new Error("Invalid Stellar address")
  }

  if (!address.startsWith("G")) {
    throw new Error("Faucet can only drip to Stellar account addresses")
  }

  return address
}

function extractHash(output: string) {
  return (
    output.match(/\/tx\/([a-f0-9]{64})/i)?.[1] ??
    output.match(/transaction:\s*([a-f0-9]{64})/i)?.[1] ??
    null
  )
}

function assertValidAsset(asset: unknown): FaucetAssetSymbol {
  if (asset === "USDC" || asset === "WBTC") {
    return asset
  }

  throw new Error("Unsupported faucet asset")
}

function decimalAmountToRaw(amount: string, decimals: number) {
  const [whole, fraction = ""] = amount.split(".")
  return BigInt(whole + fraction.padEnd(decimals, "0"))
}

async function mintWithStellarCli(
  address: string,
  asset: FaucetAssetSymbol
): Promise<FaucetResult> {
  const { execFile } = await import("node:child_process")
  const { promisify } = await import("node:util")
  const execFileAsync = promisify(execFile)
  // The test tokens are owned by steins-testnet and `mint` is owner-only, so the
  // faucet must sign as that key. Override with ASTRION_FAUCET_SOURCE only if the
  // token owner changes; the named key must exist in the server's stellar keystore.
  const source = process.env.ASTRION_FAUCET_SOURCE ?? "steins-testnet"
  const faucetAsset = FAUCET_ASSETS[asset]
  const rawAmount = decimalAmountToRaw(faucetAsset.amount, faucetAsset.decimals)

  const { stdout, stderr } = await execFileAsync(
    "stellar",
    [
      "contract",
      "invoke",
      "--id",
      faucetAsset.contractId,
      "--network",
      "testnet",
      "--source",
      source,
      "--",
      "mint",
      "--account",
      address,
      "--amount",
      rawAmount.toString(),
    ],
    { maxBuffer: 1024 * 1024 }
  )

  const rawOutput = [stdout, stderr].filter(Boolean).join("\n")
  const hash = extractHash(rawOutput)

  return {
    hash,
    amount: faucetAsset.displayAmount,
    asset,
    explorerUrl: hash
      ? `https://stellar.expert/explorer/testnet/tx/${hash}`
      : null,
    rawOutput,
  }
}

// Server only (".server" keeps this module and its shell access out of the
// client bundle). Validates input before invoking the Stellar CLI.
export async function dripTestAsset(input: { address: unknown; asset: unknown }): Promise<FaucetResult> {
  if (!IS_STELLAR_TESTNET) {
    throw new Error("The faucet is only available on Stellar testnet")
  }
  return mintWithStellarCli(assertValidAccount(input.address), assertValidAsset(input.asset))
}
