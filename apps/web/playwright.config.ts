import { defineConfig, devices } from "@playwright/test"

// Browser journeys run against the dev server with preview fixtures and a
// mocked EIP-6963 wallet. They are mocked UI tests: they don't replace
// protocol fork tests or real testnet bridge evidence.
const PORT = 3100

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    channel: process.env.PW_CHANNEL,
  },
  projects: [
    { name: "desktop-light", use: { ...devices["Desktop Chrome"], colorScheme: "light" } },
    { name: "desktop-dark", use: { ...devices["Desktop Chrome"], colorScheme: "dark" } },
    { name: "mobile-dark", use: { ...devices["Pixel 7"], colorScheme: "dark" } },
  ],
  webServer: {
    command: `node_modules/.bin/react-router dev --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/markets`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
