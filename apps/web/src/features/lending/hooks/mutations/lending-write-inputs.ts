import { TOKEN_BY_CONTRACT } from "../../lib/astrion-contracts"
import { addressArg, i128Arg } from "../../lib/soroban"

/**
 * Input for every isolated-market write. Unlike the old CorePool model, the
 * `contractId` is the market CONTRACT (not a shared pool) and the token whose
 * decimals parse the amount depends on the action (loan asset for
 * lend/withdraw/borrow/repay, collateral asset for collateral actions).
 */
export type MarketWriteInput = {
  userAddress: string
  // The market contract to invoke.
  marketAddress: string
  // The market id used for query invalidation (== marketAddress for isolated).
  marketId: string
  // The token the amount is denominated in (loan or collateral asset).
  tokenContract: string
  amount: string
  // When set, do a by-shares (max) withdraw/repay instead of by-amount. Using
  // shares avoids dust left by interest accruing between quote and submit.
  maxShares?: bigint
}

export function parseTokenAmount(amount: string, tokenContract: string) {
  const trimmed = amount.trim()
  const token = TOKEN_BY_CONTRACT[tokenContract]

  if (!token) {
    throw new Error("Unsupported token")
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

// supply(supplier, assets, on_behalf) — LEND the loan asset.
export function supplyArgs(input: MarketWriteInput) {
  const assets = parseTokenAmount(input.amount, input.tokenContract)
  return [addressArg(input.userAddress), i128Arg(assets), addressArg(input.userAddress)]
}

// supply_collateral(supplier, assets, on_behalf) — POST collateral.
export function supplyCollateralArgs(input: MarketWriteInput) {
  const assets = parseTokenAmount(input.amount, input.tokenContract)
  return [addressArg(input.userAddress), i128Arg(assets), addressArg(input.userAddress)]
}

// withdraw_collateral(caller, assets, on_behalf, receiver) — health-checked.
export function withdrawCollateralArgs(input: MarketWriteInput) {
  const assets = parseTokenAmount(input.amount, input.tokenContract)
  return [
    addressArg(input.userAddress),
    i128Arg(assets),
    addressArg(input.userAddress),
    addressArg(input.userAddress),
  ]
}

// borrow(caller, assets, on_behalf, receiver).
export function borrowArgs(input: MarketWriteInput) {
  const assets = parseTokenAmount(input.amount, input.tokenContract)
  return [
    addressArg(input.userAddress),
    i128Arg(assets),
    addressArg(input.userAddress),
    addressArg(input.userAddress),
  ]
}

// withdraw(caller, assets, shares, on_behalf, receiver). Pass shares (assets=0)
// for a max/full withdraw, else assets with shares=0.
export function withdrawArgs(input: MarketWriteInput) {
  const [assets, shares] =
    input.maxShares != null
      ? [0n, input.maxShares]
      : [parseTokenAmount(input.amount, input.tokenContract), 0n]
  return [
    addressArg(input.userAddress),
    i128Arg(assets),
    i128Arg(shares),
    addressArg(input.userAddress),
    addressArg(input.userAddress),
  ]
}

// repay(payer, assets, shares, on_behalf). Pass shares (assets=0) for a full
// repay, else assets with shares=0.
export function repayArgs(input: MarketWriteInput) {
  const [assets, shares] =
    input.maxShares != null
      ? [0n, input.maxShares]
      : [parseTokenAmount(input.amount, input.tokenContract), 0n]
  return [
    addressArg(input.userAddress),
    i128Arg(assets),
    i128Arg(shares),
    addressArg(input.userAddress),
  ]
}
