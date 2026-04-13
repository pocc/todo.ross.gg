import { test, expect, gotoHome } from "./fixtures"

test.describe("SPA Routing — Fallback", () => {
  test("root path serves the app", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
  })

  test("unknown paths return 200 with index.html (SPA fallback)", async ({ page }) => {
    const response = await page.goto("/nonexistent-page")
    expect(response?.status()).toBe(200)
    const html = await response?.text()
    expect(html).toContain('id="root"')
  })

  test("deeply nested unknown paths still serve index.html", async ({ page }) => {
    const response = await page.goto("/a/b/c/d/e")
    expect(response?.status()).toBe(200)
    const html = await response?.text()
    expect(html).toContain('id="root"')
  })
})

test.describe("SPA Routing — Directory Routes", () => {
  test("directory route renders the app layout", async ({ page }) => {
    // btoa("/tmp") = "L3RtcA=="
    await page.goto("/L3RtcA==/session")
    await page.waitForSelector("#root > *")
    // Should have rendered something (sidebar, session view, etc.)
    const childCount = await page.evaluate(
      () => document.getElementById("root")?.childElementCount ?? 0,
    )
    expect(childCount).toBeGreaterThan(0)
  })

  test("session route with ID renders the app", async ({ page }) => {
    await page.goto("/L3RtcA==/session/test-session-123")
    await page.waitForSelector("#root > *")
    const childCount = await page.evaluate(
      () => document.getElementById("root")?.childElementCount ?? 0,
    )
    expect(childCount).toBeGreaterThan(0)
  })

  test("different directory encodings produce different routes", async ({ page }) => {
    const dir1 = btoa("/home/user/project-a")
    const dir2 = btoa("/home/user/project-b")
    expect(dir1).not.toBe(dir2)

    await page.goto(`/${dir1}/session`)
    const url1 = page.url()
    expect(url1).toContain(dir1)

    await page.goto(`/${dir2}/session`)
    const url2 = page.url()
    expect(url2).toContain(dir2)
  })
})

test.describe("SPA Routing — Client-Side Navigation", () => {
  test("navigating from home to directory route via Open Directory", async ({ page }) => {
    await gotoHome(page)

    // Open directory input
    await page.locator("button", { hasText: "Open Directory" }).click()
    const input = page.locator('input[placeholder="/path/to/project"]')
    await input.fill("/home/user/project")
    await page.getByRole("button", { name: "Open", exact: true }).click()

    // Should navigate client-side (no full page reload)
    await page.waitForURL(/\/[A-Za-z0-9+/=]+\/session/)
    // App should still be rendered
    const rendered = await page.evaluate(
      () => (document.getElementById("root")?.childElementCount ?? 0) > 0,
    )
    expect(rendered).toBe(true)
  })

  test("browser back button works after navigation", async ({ page }) => {
    await gotoHome(page)

    // Navigate to a session route
    await page.locator("button", { hasText: "Open Directory" }).click()
    await page.locator('input[placeholder="/path/to/project"]').fill("/tmp")
    await page.getByRole("button", { name: "Open", exact: true }).click()
    await page.waitForURL(/\/[A-Za-z0-9+/=]+\/session/)

    // Go back
    await page.goBack()
    await page.waitForURL(/\/$/)

    // Should be back on home
    await expect(page.locator("h1")).toContainText("OpenCode Web")
  })
})
