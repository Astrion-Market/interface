import assert from "node:assert/strict"
import { test } from "node:test"
import { marketKey } from "./model.ts"
import { isReady, runPreflight } from "./preflight.ts"
import type { AaveReserve, Address } from "./model"
import type { PreflightInput } from "./preflight"

function reserve(env: "testnet" | "mainnet", asset: Address): AaveReserve {
  const ref = { protocol: "aave-v3" as const, chain: "base" as const, pool: "0x0000000000000000000000000000000000000a11" as Address, asset }
  return {
    protocol: "aave-v3",
    ref,
    key: marketKey(ref),
    env,
    name: "USDC reserve",
    readAt: "2026-10-06T12:00:00Z",
    dataState: "live",
    verified: true,
    asset: { chain: "base", address: asset, symbol: "USDC", decimals: 6 },
    status: "active",
    supplyRate: { basis: "APY", percent: "4" },
    borrowRate: { basis: "APY", percent: "5" },
    totalSupplied: 0n,
    totalBorrowed: 0n,
    availableLiquidity: 10n ** 12n,
    supplyCap: { kind: "none" },
    borrowCap: { kind: "none" },
    borrowable: true,
    collateral: { enabled: true, ltvBps: 7500, liquidationThresholdBps: 7800, liquidationBonusBps: 500 },
    restrictions: [],
  }
}

const TESTNET_USDC: Address = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
const MAINNET_USDC: Address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const USDBC: Address = "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"

function input(overrides: Partial<PreflightInput> = {}): PreflightInput {
  const market = reserve("testnet", TESTNET_USDC)
  return {
    routeEnv: "testnet",
    market,
    route: { chain: "base", protocol: "aave-v3", enabled: true, reason: null },
    action: "lend",
    amount: 100_000_000n,
    stellar: {
      address: "GAMDADDXO4XLCLIDP5ZCQRRWTP2PCA7LB2JLKWM7DSWN6WRNTXAVBPYQ",
      walletPassphrase: "Test SDF Network ; September 2015",
      usdcBalance: 2_000_000_000n,
      hasUsdcTrustline: true,
    },
    evm: { address: "0x0000000000000000000000000000000000000001", chainId: 84532, nativeBalance: 10n ** 15n },
    executionAccount: { deployed: true },
    gasSponsorship: { available: false },
    ...overrides,
  }
}

const byId = (checks: ReturnType<typeof runPreflight>) => Object.fromEntries(checks.map((c) => [c.id, c]))

test("a fully prepared testnet lend is ready", () => {
  assert.ok(isReady(runPreflight(input())))
})

test("a testnet token cannot be sent to a mainnet route", () => {
  const checks = byId(runPreflight(input({ routeEnv: "mainnet" })))
  assert.equal(checks.environment.status, "fail")
})

test("USDbC is never treated as native USDC", () => {
  const market = reserve("mainnet", USDBC)
  const checks = byId(runPreflight(input({ routeEnv: "mainnet", market })))
  assert.equal(checks.asset.status, "fail")
  assert.match(checks.asset.detail ?? "", /USDbC is bridged/)
  const native = byId(runPreflight(input({ routeEnv: "mainnet", market: reserve("mainnet", MAINNET_USDC) })))
  assert.equal(native.asset.status, "pass")
})

test("missing prerequisites name a specific fix", () => {
  const checks = byId(
    runPreflight(
      input({
        stellar: { ...input().stellar, hasUsdcTrustline: false, usdcBalance: 0n },
        evm: { ...input().evm, chainId: 1 },
        executionAccount: { deployed: false },
      })
    )
  )
  assert.match(checks.trustline.remediation ?? "", /trustline/)
  assert.match(checks["stellar-balance"].remediation ?? "", /Lower the amount/)
  assert.match(checks["evm-wallet"].remediation ?? "", /Switch your EVM wallet to Base Sepolia/)
  assert.match(checks.account.remediation ?? "", /Create your execution account/)
})

test("unread balances and unknown sponsorship are unknown, not passing", () => {
  const checks = runPreflight(
    input({
      stellar: { ...input().stellar, usdcBalance: null },
      evm: { ...input().evm, nativeBalance: null },
      gasSponsorship: { available: null },
    })
  )
  assert.equal(isReady(checks), false)
  assert.equal(byId(checks)["stellar-balance"].status, "unknown")
  assert.equal(byId(checks).gas.status, "unknown")
})

test("sponsored gas passes without an ETH balance", () => {
  const checks = byId(runPreflight(input({ evm: { ...input().evm, nativeBalance: 0n }, gasSponsorship: { available: true } })))
  assert.equal(checks.gas.status, "pass")
})

test("Stellar amounts compare in 7-decimal units", () => {
  // 100 USDC (6 decimals) needs 1,000,000,000 Stellar units.
  const exact = byId(runPreflight(input({ stellar: { ...input().stellar, usdcBalance: 1_000_000_000n } })))
  assert.equal(exact["stellar-balance"].status, "pass")
  const short = byId(runPreflight(input({ stellar: { ...input().stellar, usdcBalance: 999_999_999n } })))
  assert.equal(short["stellar-balance"].status, "fail")
})

test("a Stellar wallet on another network is blocked", () => {
  const checks = byId(
    runPreflight(input({ stellar: { ...input().stellar, walletPassphrase: "Public Global Stellar Network ; September 2015" } }))
  )
  assert.match(checks["stellar-wallet"].remediation ?? "", /Stellar Testnet/)
})

test("EVM-only actions skip Stellar checks", () => {
  const checks = byId(runPreflight(input({ action: "post-collateral", stellar: { address: null, walletPassphrase: null, usdcBalance: null, hasUsdcTrustline: null } })))
  assert.equal(checks["stellar-wallet"].status, "not-needed")
  assert.equal(checks.trustline.status, "not-needed")
})
