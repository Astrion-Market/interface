export const SOROBAN_RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org"

export const SOROBAN_NETWORK_PASSPHRASE =
  import.meta.env.VITE_SOROBAN_NETWORK_PASSPHRASE ??
  "Test SDF Network ; September 2015"

export const CONTRACTS = {
  corePool: "CCOHNWEPMIBPNI2B43NQYVGHVN3344FZKOALBN77HSV2BRR3VYYY3TST",
  liquidationEngine: "CCOBO7ABVY4XL2JNUXQH5EPQYIOOKAKQV656Z6URT5U3PD3AGKXIW7TB",
  oracleAdapter: "CCVODOMSC3YBNTXDWRVKFFTSGLBYWZYGZ2N7WCL36WUGJVZVRH5Q5E2E",
  rateModel: "CBHR3TTEVYHOTYCS2E3U2WOCLHEA25R2GOFCLMI6F5VT6A4OZ3NMRCF4",
  isolatedMarket: "CBC5C6IY2OB3QRB2K6OUW7UVVVAIIDHEU75BQIXYNTTT632MXNLOPMVP",
  marketFactory: "CBMMHD3EFPLI7PAQJGSR2S5ZM6ZTDTRVZMXBEBEWK3TJN5G5QHWUGWLN",
  mockOracle: "CCSGR2PW5LLTW6MHSPCFRFTNF5UUKGCXSN5DDK6UPF5PVJHPRIWVQHMW",
  testUsdc: "CCMO7GBSI5NNSU4DGTW4X2G6EEVIECQABIGKIUR55YRJ4VVMYN2ODSYL",
  testWbtc: "CANNEKQWI5GAEVBDTWNSVSA3SZLI4QHVF3SD3KRU4QX7YKAIUBTVJ4IS",
} as const

export const ADMIN_TREASURY =
  "GAAK4HAXR2R63O3O6MCNBFTQF7O5VGHKFLGTC7ZFGV3BV7UMCPHBUVHM"

export type ContractKey = keyof typeof CONTRACTS

export type TokenMetadata = {
  contractId: string
  symbol: string
  name: string
  decimals: number
}

export const TOKENS: Record<"USDC" | "WBTC", TokenMetadata> = {
  USDC: {
    contractId: CONTRACTS.testUsdc,
    symbol: "USDC",
    name: "Test USDC",
    decimals: 7,
  },
  WBTC: {
    contractId: CONTRACTS.testWbtc,
    symbol: "WBTC",
    name: "Test WBTC",
    decimals: 7,
  },
}

export const CORE_MARKET_ASSETS = [
  TOKENS.USDC.contractId,
  TOKENS.WBTC.contractId,
] as const

export const TOKEN_BY_CONTRACT = Object.fromEntries(
  Object.values(TOKENS).map((token) => [token.contractId, token])
) as Record<string, TokenMetadata | undefined>
