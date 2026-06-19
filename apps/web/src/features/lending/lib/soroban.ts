import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk"
import {
  ADMIN_TREASURY,
  SOROBAN_NETWORK_PASSPHRASE,
  SOROBAN_RPC_URL,
} from "./astrion-contracts"
import type { Transaction } from "@stellar/stellar-sdk"

const server = new rpc.Server(SOROBAN_RPC_URL)

type ScArg = xdr.ScVal

export function addressArg(address: string): ScArg {
  return Address.fromString(address).toScVal()
}

export function i128Arg(value: bigint | number | string): ScArg {
  return nativeToScVal(BigInt(value), { type: "i128" })
}

export function u64Arg(value: bigint | number | string): ScArg {
  return nativeToScVal(BigInt(value), { type: "u64" })
}

export function symbolArg(value: string): ScArg {
  return nativeToScVal(value, { type: "symbol" })
}

export function boolArg(value: boolean): ScArg {
  return nativeToScVal(value, { type: "bool" })
}

/** Encode a 32-byte value (e.g. a market id / salt) given as a 64-char hex string. */
export function bytesN32Arg(hex: string): ScArg {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex
  if (clean.length !== 64 || /[^0-9a-fA-F]/.test(clean)) {
    throw new Error("Expected a 32-byte hex string")
  }
  return xdr.ScVal.scvBytes(Buffer.from(clean, "hex"))
}

/** Decode an `(i128, i128)` tuple return (e.g. from `withdraw`/`repay`). */
export function decodeI128Tuple(value: unknown): [bigint, bigint] {
  if (Array.isArray(value) && value.length === 2) {
    return [BigInt(value[0]), BigInt(value[1])]
  }
  throw new Error("Expected an (i128, i128) tuple")
}

function buildReadTransaction(
  contractId: string,
  method: string,
  args: Array<ScArg>
) {
  const contract = new Contract(contractId)
  const source = new Account(ADMIN_TREASURY, "0")

  return new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: SOROBAN_NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()
}

export async function callReadContract<T = unknown>(
  contractId: string,
  method: string,
  args: Array<ScArg> = []
): Promise<T> {
  const tx = buildReadTransaction(contractId, method, args)
  const response = await server.simulateTransaction(tx)

  if ("error" in response) {
    throw new Error(response.error)
  }

  if (!response.result) {
    throw new Error(`No simulation result for ${method}`)
  }

  return scValToNative(response.result.retval) as T
}

export function buildContractOperation(
  contractId: string,
  method: string,
  args: Array<ScArg> = []
) {
  return new Contract(contractId).call(method, ...args)
}

export type WriteTransactionStep =
  | "idle"
  | "preparing"
  | "signing"
  | "submitting"
  | "confirming"
  | "confirmed"
  | "failed"

export type WriteTransactionResult = {
  hash: string
  ledger: number
}

export type SendWriteContractInput = {
  sourceAddress: string
  contractId: string
  method: string
  args?: Array<ScArg>
  signTransaction: (xdr: string) => Promise<string>
  onStep?: (step: WriteTransactionStep) => void
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sendWriteContract({
  sourceAddress,
  contractId,
  method,
  args = [],
  signTransaction,
  onStep,
}: SendWriteContractInput): Promise<WriteTransactionResult> {
  onStep?.("preparing")
  const account = await server.getAccount(sourceAddress)
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: SOROBAN_NETWORK_PASSPHRASE,
  })
    .addOperation(buildContractOperation(contractId, method, args))
    .setTimeout(60)
    .build()

  const prepared = await server.prepareTransaction(tx)

  onStep?.("signing")
  const signedXdr = await signTransaction(prepared.toXDR())
  const signed = TransactionBuilder.fromXDR(
    signedXdr,
    SOROBAN_NETWORK_PASSPHRASE
  ) as Transaction

  onStep?.("submitting")
  const submitted = await server.sendTransaction(signed)
  if (submitted.status === "ERROR") {
    throw new Error("Soroban rejected the transaction")
  }
  if (!submitted.hash) {
    throw new Error(`Unexpected submit status: ${submitted.status}`)
  }

  onStep?.("confirming")
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const result = await server.getTransaction(submitted.hash)
    if (result.status === "SUCCESS") {
      onStep?.("confirmed")
      return { hash: submitted.hash, ledger: result.ledger }
    }
    if (result.status === "FAILED") {
      throw new Error("Transaction failed on-chain")
    }
    await sleep(1_250)
  }

  throw new Error("Timed out waiting for on-chain confirmation")
}
