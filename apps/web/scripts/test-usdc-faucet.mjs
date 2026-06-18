import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

const TEST_USDC_ID =
  process.env.TEST_USDC_ID ??
  "CCMO7GBSI5NNSU4DGTW4X2G6EEVIECQABIGKIUR55YRJ4VVMYN2ODSYL"
const TEST_WBTC_ID =
  process.env.TEST_WBTC_ID ??
  "CANNEKQWI5GAEVBDTWNSVSA3SZLI4QHVF3SD3KRU4QX7YKAIUBTVJ4IS"
const SOURCE = process.env.ASTRION_FAUCET_SOURCE ?? "deployer"
const ACCOUNT =
  process.argv[2] ??
  process.env.FAUCET_TEST_ACCOUNT ??
  "GAMDADDXO4XLCLIDP5ZCQRRWTP2PCA7LB2JLKWM7DSWN6WRNTXAVBPYQ"

const ASSETS = [
  {
    contractId: TEST_USDC_ID,
    rawAmount: process.env.FAUCET_USDC_RAW_AMOUNT ?? "10000000000",
    symbol: "USDC",
  },
  {
    contractId: TEST_WBTC_ID,
    rawAmount: process.env.FAUCET_WBTC_RAW_AMOUNT ?? "100000",
    symbol: "WBTC",
  },
]

async function stellar(args) {
  const { stdout, stderr } = await execFileAsync("stellar", args, {
    maxBuffer: 1024 * 1024,
  })
  return [stdout, stderr].filter(Boolean).join("\n")
}

async function balance(contractId) {
  const output = await stellar([
    "contract",
    "invoke",
    "--id",
    contractId,
    "--network",
    "testnet",
    "--source",
    SOURCE,
    "--",
    "balance",
    "--account",
    ACCOUNT,
  ])

  return BigInt(output.match(/"(\d+)"/)?.[1] ?? "0")
}

for (const asset of ASSETS) {
  const before = await balance(asset.contractId)
  const output = await stellar([
    "contract",
    "invoke",
    "--id",
    asset.contractId,
    "--network",
    "testnet",
    "--source",
    SOURCE,
    "--",
    "mint",
    "--account",
    ACCOUNT,
    "--amount",
    asset.rawAmount,
  ])
  const after = await balance(asset.contractId)

  if (after - before !== BigInt(asset.rawAmount)) {
    throw new Error(
      `${asset.symbol}: expected balance delta ${asset.rawAmount}, got ${
        after - before
      }`
    )
  }

  const hash = output.match(/\/tx\/([a-f0-9]{64})/i)?.[1] ?? "unknown"
  console.log(`${asset.symbol} faucet test passed`)
  console.log(`Account: ${ACCOUNT}`)
  console.log(`Delta: ${after - before}`)
  console.log(`Tx: ${hash}`)
}
