import { test, expect, gotoHome, collectConsoleErrors, expectAssetStatus } from "./fixtures"

test.describe("Static Asset Delivery", () => {
  test("HTML page returns 200", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
    expect(response?.headers()["content-type"]).toContain("text/html")
  })

  test("HTML contains the app root element", async ({ page }) => {
    const response = await page.goto("/")
    const html = await response?.text()
    expect(html).toContain('id="root"')
    expect(html).toContain('<script type="module"')
  })

  test("favicon.svg loads with correct content type", async ({ page }) => {
    const response = await expectAssetStatus(page, "/favicon.svg", 200)
    const ct = response?.headers()["content-type"] ?? ""
    expect(ct).toMatch(/svg/)
  })

  test("JS bundle loads and executes", async ({ page }) => {
    await gotoHome(page)
    const rendered = await page.evaluate(
      () => (document.getElementById("root")?.childElementCount ?? 0) > 0,
    )
    expect(rendered).toBe(true)
  })

  test("CSS is applied (body has background color)", async ({ page }) => {
    await gotoHome(page)
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor,
    )
    expect(bg).not.toBe("rgba(0, 0, 0, 0)")
    expect(bg).not.toBe("")
  })

  test("no unexpected console errors on initial load", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await gotoHome(page)
    await page.waitForTimeout(2000)
    expect(errors).toHaveLength(0)
  })

  test("no unhandled JS exceptions on load", async ({ page }) => {
    const exceptions: string[] = []
    page.on("pageerror", (err) => {
      // Ignore network-related errors (no server running)
      if (!err.message.includes("fetch") && !err.message.includes("NetworkError")) {
        exceptions.push(err.message)
      }
    })
    await gotoHome(page)
    await page.waitForTimeout(2000)
    expect(exceptions).toHaveLength(0)
  })
})

test.describe("Cache & Performance Headers", () => {
  test("HTML is not aggressively cached", async ({ page }) => {
    const response = await page.goto("/")
    const cacheControl = response?.headers()["cache-control"] ?? ""
    // HTML should not have long-lived cache
    expect(cacheControl).not.toContain("max-age=31536000")
  })

  test("HTML response has reasonable size", async ({ page }) => {
    const response = await page.goto("/")
    const body = await response?.body()
    const size = body?.length ?? 0
    // Our index.html should be under 5KB (it's minimal)
    expect(size).toBeGreaterThan(100)
    expect(size).toBeLessThan(5000)
  })
})
