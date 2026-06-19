export const SOROBAN_RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org"

export const SOROBAN_NETWORK_PASSPHRASE =
  import.meta.env.VITE_SOROBAN_NETWORK_PASSPHRASE ??
  "Test SDF Network ; September 2015"

// steins-testnet deployment (2026-06-19). Supersedes the abandoned `deployer`
// CorePool deployment. Canonical list:
// contracts/deployments/testnet/addresses.env
export const CONTRACTS = {
  oracleAdapter: "CACJW5GN3RDF5LH3HZNYFJHLY5B257E2TPYMHFMCDFERL7E3WXNRK7QO",
  rateModel: "CBUDQ3AVT4KLA4RGIN5A5PBCBKHUKJ2Z6LI3ANIPJHVWOE54BPM3WTUV",
  corePool: "CDWDB7LNEW3SR42PUCB7KMLC6A3V6K2J6MG6ETEFHQ3ZO5EU4FVENJJ2", // legacy
  liquidationEngine: "CD3LP3GPNSV2WROGZQ5JLIRW7UXKVPQGAGUFPXNNPG3OXGYMIJ3RYXPZ", // legacy
  marketFactory: "CBM4BW772GFRAKX233ZJHGTAWN3WC4WPWGJIUJAO66B67NR7PYZ4PCWH",
  vaultFactory: "CCGA3ZPHRLPSVVH6JD7KC27HYWRP6KDHK6Z2G7XHJHUJU4ILX4VPRWBQ",
  adapterRegistry: "CAG67HPHYQW6LUTQRURE36SCWDPDQCCTRFAFWGO7LOHDTX5S3IYCJECI",
  mockOracle: "CCKZQRVYXA7C66LJ6FAPKWTAB3RZTRM5S2RL473ZZ73LQYKKEJONMINQ",
  testUsdc: "CDZ4L3GZH4TGMOQC7XXPO3IKYABJM2FB2OGYXLZ7SPFFHM5HCLME3J7D",
  testWbtc: "CCBD6JIWJDHWSURR3NU42QRIWHGUHF4XLMPES7PI6RLTQUCEBG5MVP6T",
} as const

// Demo instances created at deploy time (first integration / E2E).
export const DEMO = {
  market: "CCKXGK4SE3XW5M4MRRX3NKV5UOTQ57V73OVYUEFHAQ2GJOCYNTW36MRH", // WBTC collateral / USDC loan, 70% LLTV
  vault: "CDBJHSHCWGZ3DXRBL6K4IWP5BGWBIOU5PWBNLVAUT24RZNKZHTUFNO3A", // USDC vault "aUSDC"
  marketAdapter: "CCHVHZFO5U74DT4JE2GHTFPKPWI5FIJ4IABRNVFB2OBGTR4DOZGD6YID",
} as const

// Admin / owner / treasury for steins-testnet.
export const ADMIN_TREASURY =
  "GAUHMCMUP5FZO5675W3ISZ6E6CNYJGXBUW5WANE2JR4TGAARYCTSCBKI"

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
