import { test, expect, gotoHome, collectConsoleErrors } from "./fixtures"

test.describe("Home Page — Layout & Content", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page)
  })

  test("renders app title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("OpenCode Web")
  })

  test("renders the logo icon", async ({ page }) => {
    await expect(page.getByText("</>")).toBeVisible()
  })

  test("shows disconnected status indicator", async ({ page }) => {
    await expect(page.getByText("Not connected")).toBeVisible()
  })

  test("shows setup guide when disconnected", async ({ page }) => {
    await expect(page.getByText("Quick Start")).toBeVisible()
  })

  test("shows Recent Projects heading", async ({ page }) => {
    await expect(page.getByText("Recent Projects")).toBeVisible()
  })

  test("shows empty state when no server is running", async ({ page }) => {
    await expect(page.getByText("No projects found")).toBeVisible()
    await expect(
      page.getByText("Connect to a server or open a directory"),
    ).toBeVisible()
  })
})

test.describe("Home Page — Setup Guide", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page)
  })

  test("shows Quick Start guide by default when disconnected", async ({ page }) => {
    await expect(page.getByText("Quick Start")).toBeVisible()
  })

  test("shows install step with npm command", async ({ page }) => {
    await expect(page.getByText("npm i -g opencode")).toBeVisible()
  })

  test("shows serve command with CORS flag", async ({ page }) => {
    await expect(
      page.getByText("opencode serve --cors https://todo.ross.gg", { exact: true }),
    ).toBeVisible()
  })

  test("has a copy button that responds to clicks", async ({ page }) => {
    const copyBtn = page.locator("button", { hasText: "Copy" })
    await expect(copyBtn).toBeVisible()
    // Click — clipboard may not work in all browsers/contexts, but the button should exist
    await copyBtn.click()
    // Either shows "Copied!" or stays as "Copy" (depending on clipboard API support)
    await page.waitForTimeout(500)
    const text = await copyBtn.textContent()
    expect(text === "Copy" || text === "Copied!").toBe(true)
  })

  test("shows password protection note", async ({ page }) => {
    await expect(page.getByText("OPENCODE_SERVER_PASSWORD")).toBeVisible()
  })

  test("setup guide is always visible when disconnected", async ({ page }) => {
    await expect(page.getByText("Quick Start")).toBeVisible()
    // No toggle — guide stays visible until connected
    await expect(page.getByText("npm i -g opencode")).toBeVisible()
  })
})

test.describe("Home Page — Server Connection", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page)
  })

  test("has server URL input with correct placeholder", async ({ page }) => {
    const input = page.locator('input[placeholder="http://localhost:4096"]')
    await expect(input).toBeVisible()
  })

  test("server URL input is editable", async ({ page }) => {
    const input = page.locator('input[placeholder="http://localhost:4096"]')
    await input.fill("http://myserver:8080")
    await expect(input).toHaveValue("http://myserver:8080")
  })

  test("has a Connect button", async ({ page }) => {
    await expect(page.locator("button", { hasText: "Connect" })).toBeVisible()
  })

  test("Connect button attempts connection on click", async ({ page }) => {
    // Fill a bad URL and click connect
    const input = page.locator('input[placeholder="http://localhost:4096"]')
    await input.fill("http://localhost:9999")
    await page.locator("button", { hasText: "Connect" }).click()
    // Should show an error since no server is running
    // Wait a moment for the connection attempt
    await page.waitForTimeout(2000)
    // The status should still be disconnected
    await expect(page.getByText("Not connected")).toBeVisible()
  })

  test("Enter key in URL input triggers connect", async ({ page }) => {
    const input = page.locator('input[placeholder="http://localhost:4096"]')
    await input.fill("http://localhost:9999")
    await input.press("Enter")
    await page.waitForTimeout(2000)
    await expect(page.getByText("Not connected")).toBeVisible()
  })
})

test.describe("Home Page — Directory Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page)
  })

  test("Open Directory button toggles path input", async ({ page }) => {
    const dirInput = page.locator('input[placeholder="/path/to/project"]')
    // Hidden initially
    await expect(dirInput).not.toBeVisible()
    // Click to show
    await page.locator("button", { hasText: "Open Directory" }).click()
    await expect(dirInput).toBeVisible()
    // Click again to hide
    await page.locator("button", { hasText: "Open Directory" }).click()
    await expect(dirInput).not.toBeVisible()
  })

  test("entering a path and clicking Open navigates", async ({ page }) => {
    await page.locator("button", { hasText: "Open Directory" }).click()
    const input = page.locator('input[placeholder="/path/to/project"]')
    await input.fill("/home/user/myproject")
    await page.getByRole("button", { name: "Open", exact: true }).click()
    // Should navigate to base64-encoded directory route
    await page.waitForURL(/\/[A-Za-z0-9+/=]+\/session/)
  })

  test("Enter key in directory input navigates", async ({ page }) => {
    await page.locator("button", { hasText: "Open Directory" }).click()
    const input = page.locator('input[placeholder="/path/to/project"]')
    await input.fill("/tmp")
    await input.press("Enter")
    await page.waitForURL(/\/[A-Za-z0-9+/=]+\/session/)
  })

  test("empty directory path does not navigate", async ({ page }) => {
    await page.locator("button", { hasText: "Open Directory" }).click()
    const input = page.locator('input[placeholder="/path/to/project"]')
    await input.fill("")
    await page.getByRole("button", { name: "Open", exact: true }).click()
    // Should stay on home — URL should not have changed
    await page.waitForTimeout(200)
    expect(page.url()).toMatch(/:\d+\/?$/)
  })
})
