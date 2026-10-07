import { MARKETS, expect, review, test } from "./fixtures"

test.describe("market discovery", () => {
  test("filters by action and protocol, and hides unapproved markets", async ({ page }) => {
    await page.goto("/markets")
    await expect(page.getByText("Preview data").first()).toBeVisible()
    await page.getByRole("button", { name: "Borrow", exact: true }).click()
    await page.getByRole("button", { name: "Morpho Blue", exact: true }).click()
    await expect(page.getByRole("link", { name: /cbETH \/ USDC · 86% LLTV/ })).toBeVisible()
    await expect(page.getByText("WETH / USDC · 91.5% LLTV")).toHaveCount(0)
    await page.getByRole("button", { name: /discovered market not on the approved list/ }).click()
    await expect(page.getByText("Not approved")).toBeVisible()
    await expect(page).toHaveURL(/action=borrow/)
  })

  test("unknown data is never shown as zero", async ({ page }) => {
    await page.goto("/markets?chain=ethereum&protocol=morpho-blue")
    await expect(page.getByText("Unknown").first()).toBeVisible()
    await expect(page.getByText(/Data unavailable/)).toBeVisible()
  })

  test("a frozen reserve explains why lending is blocked", async ({ page }) => {
    await page.goto("/markets/base/aave-v3/0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22")
    await expect(page.getByText("This reserve is frozen: only withdraw and repay are allowed.")).toBeVisible()
    await expect(page.getByText("Actions are disabled")).toBeVisible()
  })

  test("a malformed market link is rejected", async ({ page }) => {
    await page.goto("/markets/base/aave-v3/not-an-address")
    await expect(page.getByText("Market link not recognized")).toBeVisible()
  })
})

test.describe("supply journey", () => {
  test("quotes without a wallet and invalidates on change", async ({ page }) => {
    await review(page, MARKETS.aaveUsdc, "lend")
    await page.getByPlaceholder("0.00").fill("250")
    await page.getByRole("button", { name: "Get quote" }).click()
    await expect(page.getByText(/Expires in \d+s/)).toBeVisible()
    await expect(page.getByText("Stellar wallet:", { exact: false })).toBeVisible()
    await page.getByPlaceholder("0.00").fill("251")
    await expect(page.getByText("Needs refresh")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign and submit" })).toBeDisabled()
  })

  test("blocks fees above 1% of a small amount", async ({ page }) => {
    await review(page, MARKETS.aaveUsdc, "lend")
    await page.getByPlaceholder("0.00").fill("1")
    await page.getByRole("button", { name: "Get quote" }).click()
    await expect(page.getByText("Fees would be more than 1% of the amount.", { exact: false })).toBeVisible()
  })

  test("simulated success reaches Complete through every leg", async ({ page }) => {
    await review(page, MARKETS.aaveUsdc, "lend")
    await page.getByPlaceholder("0.00").fill("250")
    await page.getByRole("button", { name: "Get quote" }).click()
    await page.getByRole("button", { name: "Run simulation" }).click()
    await expect(page).toHaveURL(/\/activity\/sim-/)
    await expect(page.getByText("Simulated: no funds moved")).toBeVisible()
    await expect(page.getByText("Complete", { exact: true })).toBeVisible({ timeout: 15_000 })
  })

  test("a failed supply leaves funds on Base with recovery steps", async ({ page }) => {
    await review(page, MARKETS.aaveUsdc, "lend")
    await page.getByPlaceholder("0.00").fill("250")
    await page.getByRole("button", { name: "Get quote" }).click()
    await page.getByLabel(/on the lending chain fails/).check()
    await page.getByRole("button", { name: "Run simulation" }).click()
    await expect(page.getByText("Funds available on Base")).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText("Retry the lending action")).toBeVisible()
    await expect(page.getByText(/A retry resubmits only: Lending action/)).toBeVisible()
    const download = page.waitForEvent("download")
    await page.getByRole("button", { name: /Download diagnostics/ }).click()
    expect((await download).suggestedFilename()).toMatch(/diagnostics\.json$/)
  })

  test("activity survives a reload and hides other wallets' operations", async ({ page }) => {
    await review(page, MARKETS.aaveUsdc, "lend")
    await page.getByPlaceholder("0.00").fill("300")
    await page.getByRole("button", { name: "Get quote" }).click()
    await page.getByRole("button", { name: "Run simulation" }).click()
    await expect(page).toHaveURL(/\/activity\/sim-/)
    await page.reload()
    await expect(page.getByRole("heading", { name: "Lend 300 USDC" })).toBeVisible()
    await page.goto("/settings")
    await page.getByRole("button", { name: "Connect EVM" }).first().click()
    await page.getByRole("menuitem", { name: "Mock Wallet" }).click()
    await page.goto("/activity")
    await expect(page.getByText(/from other wallet combinations/)).toBeVisible()
  })
})

test.describe("borrow, repay, withdraw", () => {
  test("borrow preview blocks more than the collateral supports", async ({ page }) => {
    await review(page, MARKETS.morpho86, "borrow")
    await page.getByPlaceholder("0.0", { exact: true }).fill("1")
    await page.getByPlaceholder("0.00").fill("3000")
    await expect(page.getByText("This borrow is more than the collateral supports.")).toBeVisible()
  })

  test("a borrow with a failed payout is labeled and recoverable", async ({ page }) => {
    await review(page, MARKETS.morpho86, "borrow")
    await page.getByPlaceholder("0.0", { exact: true }).fill("1")
    await page.getByPlaceholder("0.00").fill("1000")
    await page.getByPlaceholder("G…").fill("GAMDADDXO4XLCLIDP5ZCQRRWTP2PCA7LB2JLKWM7DSWN6WRNTXAVBPYQ")
    await page.getByRole("button", { name: "Get quote" }).click()
    await page.getByLabel("The transfer back to Stellar fails").check()
    await page.getByRole("button", { name: "Run simulation" }).click()
    await expect(page.getByText("Borrowed; USDC not yet sent to Stellar").first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText("Send the USDC back to Stellar")).toBeVisible()
  })

  test("full repayment discloses the transit buffer", async ({ page }) => {
    await review(page, MARKETS.morpho86, "repay")
    await page.getByLabel("Repay in full").check()
    await expect(page.getByText(/buffer for about 30 minutes/)).toBeVisible()
    await expect(page.getByText(/declining it leaves/)).toBeVisible()
    await expect(page.getByText("Repay directly from your EVM wallet instead")).toBeVisible()
  })

  test("unsafe collateral withdrawal is blocked", async ({ page }) => {
    await review(page, MARKETS.morpho86, "withdraw-collateral")
    await page.getByPlaceholder("0.00").fill("0.6")
    await expect(page.getByText("This withdrawal would put the position at risk of liquidation.")).toBeVisible()
  })

  test("withdrawals beyond supply are blocked", async ({ page }) => {
    await review(page, MARKETS.morpho86, "withdraw")
    await page.getByPlaceholder("0.00").fill("600")
    await expect(page.getByText("This is more than you have supplied.")).toBeVisible()
  })
})

test.describe("portfolio", () => {
  test("without readers it never claims there are no positions", async ({ page }) => {
    await page.goto("/portfolio")
    await expect(page.getByText("Connect your EVM wallet to see cross-chain positions")).toBeVisible()
  })

  test("a failed read shows partial data, not a healthy portfolio", async ({ page }) => {
    await page.goto("/portfolio?sample=true")
    await expect(page.getByText("Some positions couldn't be read")).toBeVisible()
    await expect(page.getByText(/Compound III on Ethereum couldn't be read/)).toBeVisible()
  })
})

test.describe("wallets", () => {
  test("decline, connect, wrong network, account switch, and lock", async ({ page }) => {
    await page.goto("/settings")
    const panel = page.getByRole("region", { name: "Wallets" })
    await page.evaluate(() => ((window as unknown as { __mockWallet: { state: { reject: boolean } } }).__mockWallet.state.reject = true))
    await panel.getByRole("button", { name: "Connect EVM" }).click()
    await page.getByRole("menuitem", { name: "Mock Wallet" }).click()
    await expect(page.getByText("You declined the request in your wallet. Nothing was signed.")).toBeVisible()

    await page.evaluate(() => ((window as unknown as { __mockWallet: { state: { reject: boolean } } }).__mockWallet.state.reject = false))
    await panel.getByRole("button", { name: "Connect EVM" }).click()
    await page.getByRole("menuitem", { name: "Mock Wallet" }).click()
    await expect(panel.getByText("Base Sepolia").first()).toBeVisible()

    const { emitWallet } = await import("./fixtures")
    await emitWallet(page, "chainChanged", "0x1")
    await expect(panel.getByText("Unsupported network")).toBeVisible()
    await emitWallet(page, "chainChanged", "0x14a34")
    await emitWallet(page, "accountsChanged", ["0x9999000000000000000000000000000000000009"])
    await expect(page.getByText(/switched accounts/)).toBeVisible()

    await page.reload()
    await expect(panel.getByText("Connected")).toBeVisible()
    await emitWallet(page, "accountsChanged", [])
    await expect(page.getByText(/locked or disconnected/)).toBeVisible()
  })
})

test.describe("keyboard", () => {
  test("skip link and market filters work from the keyboard", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard checks run on desktop projects")
    await page.goto("/markets")
    await page.keyboard.press("Tab")
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused()
    const borrow = page.getByRole("button", { name: "Borrow", exact: true })
    await borrow.focus()
    await page.keyboard.press("Enter")
    await expect(borrow).toHaveAttribute("aria-pressed", "true")
  })
})
