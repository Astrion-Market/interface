import { test as base, expect } from "@playwright/test"
import type { Page } from "@playwright/test"

// An injected EIP-6963 wallet. Accounts persist in localStorage like a real
// wallet's site permission, and tests drive events through window.__mockWallet.
const MOCK_WALLET = `(() => {
  const listeners = {}
  const state = {
    accounts: JSON.parse(localStorage.getItem("mock.accounts") || "[]"),
    chainId: "0x14a34",
    reject: false,
  }
  const save = () => localStorage.setItem("mock.accounts", JSON.stringify(state.accounts))
  const provider = {
    request: async ({ method }) => {
      if (method === "eth_requestAccounts") {
        if (state.reject) throw Object.assign(new Error("User rejected"), { code: 4001 })
        state.accounts = ["0xAbCdEf0000000000000000000000000000001234"]
        save()
        return state.accounts
      }
      if (method === "eth_accounts") return state.accounts
      if (method === "eth_chainId") return state.chainId
      if (method === "eth_getBalance") return "0x38d7ea4c68000"
      if (method === "wallet_switchEthereumChain") return null
      if (method === "wallet_revokePermissions") { state.accounts = []; save(); return null }
      throw Object.assign(new Error("unsupported " + method), { code: 4200 })
    },
    on: (e, f) => { (listeners[e] = listeners[e] || []).push(f) },
    removeListener: (e, f) => { listeners[e] = (listeners[e] || []).filter((x) => x !== f) },
  }
  window.__mockWallet = {
    state,
    emit: (e, v) => {
      if (e === "chainChanged") state.chainId = v
      if (e === "accountsChanged") { state.accounts = v; save() }
      ;(listeners[e] || []).forEach((f) => f(v))
    },
  }
  const announce = () => window.dispatchEvent(new CustomEvent("eip6963:announceProvider", {
    detail: Object.freeze({
      info: { uuid: "mock-1", name: "Mock Wallet", icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E", rdns: "dev.astrion.mock" },
      provider,
    }),
  }))
  window.addEventListener("eip6963:requestProvider", announce)
  announce()
})()`

export const test = base.extend<{ mockWallet: void }>({
  // Navigation waits for the network to settle so clicks never land before
  // React hydrates the server-rendered page.
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page)
    const reload = page.reload.bind(page)
    page.goto = async (url, options) => {
      const response = await goto(url, options)
      await page.waitForLoadState("networkidle")
      return response
    }
    page.reload = async (options) => {
      const response = await reload(options)
      await page.waitForLoadState("networkidle")
      return response
    }
    await use(page)
  },
  mockWallet: [
    async ({ page }, use) => {
      await page.addInitScript(MOCK_WALLET)
      await use()
    },
    { auto: true },
  ],
})

export { expect }

export const MARKETS = {
  aaveUsdc: "base:aave-v3:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  morpho86: "base:morpho-blue:0x0000000000000000000000000000000000000000000000000000000000000b01",
  comet: "base:compound-v3:0xb125e6687d4313864e53df431d5425969c15eb2f",
}

export async function review(page: Page, market: string, action: string) {
  await page.goto(`/review?market=${market}&action=${action}`)
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Review")
}

export async function emitWallet(page: Page, event: string, value: unknown) {
  await page.evaluate(([e, v]) => (window as unknown as { __mockWallet: { emit: (e: unknown, v: unknown) => void } }).__mockWallet.emit(e, v), [event, value] as const)
}
