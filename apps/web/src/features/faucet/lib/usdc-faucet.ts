import { createServerFn } from "@tanstack/react-start"
import { Address } from "@stellar/stellar-sdk"
import { TOKENS } from "../../lending/lib/astrion-contracts"

export type FaucetAssetSymbol = "USDC" | "WBTC"

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

type FaucetResult = {
  hash: string | null
  amount: string
  asset: FaucetAssetSymbol
  explorerUrl: string | null
  rawOutput: string
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
  const source = process.env.ASTRION_FAUCET_SOURCE ?? "deployer"
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

export const dripTestAsset = createServerFn({ method: "POST" })
  .inputValidator((data: { address: string; asset: FaucetAssetSymbol }) => ({
    address: assertValidAccount(data.address),
    asset: assertValidAsset(data.asset),
  }))
  .handler(async ({ data }) => {
    return mintWithStellarCli(data.address, data.asset)
  })
