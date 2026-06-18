import { CONTRACTS, TOKEN_BY_CONTRACT } from "../../lib/astrion-contracts"
import { addressArg, i128Arg } from "../../lib/soroban"

export type LendingWriteInput = {
  userAddress: string
  marketId: string
  amount: string
}

export type CollateralWriteInput = Omit<LendingWriteInput, "amount">

export function parseTokenAmount(amount: string, marketId: string) {
  const trimmed = amount.trim()
  const token = TOKEN_BY_CONTRACT[marketId]

  if (!token) {
    throw new Error("Unsupported market asset")
  }
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Enter a valid amount")
  }

  const [whole, fraction = ""] = trimmed.split(".")
  if (fraction.length > token.decimals) {
    throw new Error(`${token.symbol} supports ${token.decimals} decimals`)
  }

  const raw = BigInt(whole + fraction.padEnd(token.decimals, "0"))
  if (raw <= 0n) {
    throw new Error("Amount must be greater than zero")
  }

  return raw
}

export function lendingAmountArgs(input: LendingWriteInput) {
  return [
    addressArg(input.userAddress),
    addressArg(input.marketId),
    i128Arg(parseTokenAmount(input.amount, input.marketId)),
  ]
}

export function lendingCollateralArgs(input: CollateralWriteInput) {
  return [addressArg(input.userAddress), addressArg(input.marketId)]
}

export const corePoolWrite = {
  contractId: CONTRACTS.corePool,
}
