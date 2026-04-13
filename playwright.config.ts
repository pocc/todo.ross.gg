import { defineConfig, devices } from "@playwright/test"

const isCI = !!process.env.CI
const baseURL = process.env.BASE_URL || "http://localhost:3000"

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? "github" : [["html", { open: "never" }], ["list"]],

  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  webServer: baseURL.includes("localhost")
    ? {
        command: "npm run dev",
        port: 3000,
        reuseExistingServer: !isCI,
        timeout: 15_000,
      }
    : undefined,
})
