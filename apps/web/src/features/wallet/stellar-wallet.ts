import { SOROBAN_NETWORK_PASSPHRASE } from "../lending/lib/astrion-contracts"

const HORIZON_URL =
  import.meta.env.VITE_STELLAR_HORIZON_URL ??
  "https://horizon-testnet.stellar.org"

const CONNECTED_ADDRESS_KEY = "astrion.wallet.address"

let initialized = false

function readCssVariable(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()

  return value || fallback
}

function getWalletKitTheme(mode: "dark" | "light") {
  const isDark = mode === "dark"

  return {
    background: readCssVariable(
      "--popover",
      isDark ? "oklch(0.16 0.018 262)" : "oklch(1 0.001 250)"
    ),
    "background-secondary": readCssVariable(
      "--card",
      isDark ? "oklch(0.16 0.018 262)" : "oklch(1 0.001 250)"
    ),
    "foreground-strong": readCssVariable(
      "--foreground",
      isDark ? "oklch(0.965 0.006 225)" : "oklch(0.13 0.012 258)"
    ),
    foreground: readCssVariable(
      "--foreground",
      isDark ? "oklch(0.965 0.006 225)" : "oklch(0.13 0.012 258)"
    ),
    "foreground-secondary": readCssVariable(
      "--muted-foreground",
      isDark ? "oklch(0.60 0.014 238)" : "oklch(0.50 0.012 240)"
    ),
    primary: readCssVariable(
      "--primary",
      isDark ? "oklch(0.72 0.155 222)" : "oklch(0.50 0.175 222)"
    ),
    "primary-foreground": readCssVariable(
      "--primary-foreground",
      isDark ? "oklch(0.09 0.01 261)" : "oklch(0.985 0.005 220)"
    ),
    transparent: "rgba(0, 0, 0, 0)",
    lighter: readCssVariable(
      "--muted",
      isDark ? "oklch(0.20 0.016 260)" : "oklch(0.95 0.006 240)"
    ),
    light: readCssVariable(
      "--accent",
      isDark ? "oklch(0.22 0.018 260)" : "oklch(0.94 0.01 240)"
    ),
    "light-gray": readCssVariable(
      "--border",
      isDark ? "oklch(1 0 0 / 9%)" : "oklch(0.88 0.01 240)"
    ),
    gray: readCssVariable(
      "--muted-foreground",
      isDark ? "oklch(0.60 0.014 238)" : "oklch(0.50 0.012 240)"
    ),
    danger: readCssVariable(
      "--destructive",
      isDark ? "oklch(0.65 0.22 25)" : "oklch(0.577 0.245 27.325)"
    ),
    border: readCssVariable(
      "--border",
      isDark ? "oklch(1 0 0 / 9%)" : "oklch(0.88 0.01 240)"
    ),
    shadow: isDark
      ? "0 18px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08)"
      : "0 18px 60px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(15, 23, 42, 0.08)",
    "border-radius": readCssVariable("--radius", "0.375rem"),
    "font-family": readCssVariable(
      "--font-sans",
      "'Geist Variable', sans-serif"
    ),
  }
}

async function initWalletKit() {
  const [{ Networks, StellarWalletsKit }, { defaultModules }] =
    await Promise.all([
      import("@creit.tech/stellar-wallets-kit"),
      import("@creit.tech/stellar-wallets-kit/modules/utils"),
    ])

  if (!initialized) {
    StellarWalletsKit.init({
      network:
        SOROBAN_NETWORK_PASSPHRASE === Networks.PUBLIC
          ? Networks.PUBLIC
          : Networks.TESTNET,
      modules: defaultModules(),
      theme: getWalletKitTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      ),
      authModal: {
        hideUnsupportedWallets: false,
        showInstallLabel: true,
      },
    })
    initialized = true
  }

  return StellarWalletsKit
}

export async function setStellarWalletKitTheme(mode: "dark" | "light") {
  const kit = await initWalletKit()
  kit.setTheme(getWalletKitTheme(mode))
}

export async function connectStellarWallet() {
  const kit = await initWalletKit()
  const { address } = await kit.authModal()

  localStorage.setItem(CONNECTED_ADDRESS_KEY, address)
  return address
}

export async function disconnectStellarWallet() {
  const kit = await initWalletKit()
  await kit.disconnect()
  localStorage.removeItem(CONNECTED_ADDRESS_KEY)
}

export async function signStellarTransaction(xdr: string, address: string) {
  const kit = await initWalletKit()
  const { signedTxXdr } = await kit.signTransaction(xdr, {
    address,
    networkPassphrase: SOROBAN_NETWORK_PASSPHRASE,
  })

  return signedTxXdr
}

export async function restoreStellarWalletAddress() {
  const storedAddress = localStorage.getItem(CONNECTED_ADDRESS_KEY)
  if (storedAddress) return storedAddress

  try {
    const kit = await initWalletKit()
    const { address } = await kit.getAddress()
    if (address) {
      localStorage.setItem(CONNECTED_ADDRESS_KEY, address)
      return address
    }
  } catch {
    return null
  }

  return null
}

type HorizonBalance = {
  balance: string
  asset_type: string
}

type HorizonAccount = {
  balances: Array<HorizonBalance>
}

export async function getNativeXlmBalance(address: string) {
  const response = await fetch(`${HORIZON_URL}/accounts/${address}`)

  if (response.status === 404) {
    return "0.0000000"
  }

  if (!response.ok) {
    throw new Error("Unable to load XLM balance")
  }

  const account = (await response.json()) as HorizonAccount
  return (
    account.balances.find((balance) => balance.asset_type === "native")
      ?.balance ?? "0.0000000"
  )
}

// Network the wallet itself is using. Not every wallet reports it; null means
// unknown, never "matches".
export async function getStellarWalletPassphrase(): Promise<string | null> {
  try {
    const kit = await initWalletKit()
    const { networkPassphrase } = await kit.getNetwork()
    return networkPassphrase || null
  } catch {
    return null
  }
}

export type StellarUsdcStatus = {
  // False when the account has not been created (funded) on this network.
  funded: boolean
  hasTrustline: boolean
  // Balance in 7-decimal raw units; 0 when there is no trustline.
  balanceRaw: bigint
}

export async function getStellarUsdcStatus(
  horizon: string,
  address: string,
  issuer: string
): Promise<StellarUsdcStatus> {
  const response = await fetch(`${horizon}/accounts/${address}`)
  if (response.status === 404) return { funded: false, hasTrustline: false, balanceRaw: 0n }
  if (!response.ok) throw new Error("Unable to read the Stellar account")
  const account = (await response.json()) as {
    balances: Array<HorizonBalance & { asset_code?: string; asset_issuer?: string }>
  }
  const line = account.balances.find((b) => b.asset_code === "USDC" && b.asset_issuer === issuer)
  if (!line) return { funded: true, hasTrustline: false, balanceRaw: 0n }
  // Horizon always returns seven fraction digits, e.g. "12.3400000".
  const [whole, fraction = ""] = line.balance.split(".")
  return { funded: true, hasTrustline: true, balanceRaw: BigInt(whole) * 10_000_000n + BigInt(fraction.padEnd(7, "0").slice(0, 7)) }
}
