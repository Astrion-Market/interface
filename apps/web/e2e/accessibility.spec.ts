import AxeBuilder from "@axe-core/playwright"
import { MARKETS, expect, test } from "./fixtures"

const PAGES = [
  "/",
  "/markets",
  "/markets/base/morpho-blue/0x0000000000000000000000000000000000000000000000000000000000000b01",
  `/review?market=${MARKETS.aaveUsdc}&action=lend`,
  "/activity",
  "/portfolio?sample=true",
  "/dashboard?sample=true",
  "/settings",
  "/docs",
  "/design-system",
]

for (const path of PAGES) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState("networkidle")
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([])
  })
}
