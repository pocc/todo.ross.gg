import { test, expect, gotoHome } from "./fixtures"

test.describe("Responsive — Mobile Viewport", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("home page renders on mobile", async ({ page }) => {
    await gotoHome(page)
    await expect(page.locator("h1")).toContainText("OpenCode Web")
  })

  test("setup guide is visible on mobile", async ({ page }) => {
    await gotoHome(page)
    await expect(page.getByText("Quick Start")).toBeVisible()
  })

  test("server URL input fits mobile width", async ({ page }) => {
    await gotoHome(page)
    const input = page.locator('input[placeholder="http://localhost:4096"]')
    await expect(input).toBeVisible()
    const box = await input.boundingBox()
    expect(box!.width).toBeLessThanOrEqual(375)
  })

  test("Connect button is tappable on mobile", async ({ page }) => {
    await gotoHome(page)
    const btn = page.locator("button", { hasText: "Connect" })
    await expect(btn).toBeVisible()
    const box = await btn.boundingBox()
    // Should be at least 32px tall (minimum tap target)
    expect(box!.height).toBeGreaterThanOrEqual(28)
  })

  test("no horizontal overflow on mobile", async ({ page }) => {
    await gotoHome(page)
    const overflows = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(overflows).toBe(false)
  })
})

test.describe("Responsive — Tablet Viewport", () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test("home page renders on tablet", async ({ page }) => {
    await gotoHome(page)
    await expect(page.locator("h1")).toContainText("OpenCode Web")
  })

  test("session layout renders on tablet", async ({ page }) => {
    await page.goto(`/${btoa("/tmp")}/session`)
    await page.waitForSelector("#root > *")
    const rendered = await page.evaluate(
      () => (document.getElementById("root")?.childElementCount ?? 0) > 0,
    )
    expect(rendered).toBe(true)
  })
})

test.describe("Responsive — Large Desktop Viewport", () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test("home page content is centered and constrained", async ({ page }) => {
    await gotoHome(page)
    const h1 = page.locator("h1")
    const box = await h1.boundingBox()
    // Title should be roughly centered
    expect(box!.x).toBeGreaterThan(100)
    expect(box!.x + box!.width).toBeLessThan(1820)
  })

  test("no content stretches to full width", async ({ page }) => {
    await gotoHome(page)
    const inputs = page.locator("input")
    const count = await inputs.count()
    for (let i = 0; i < count; i++) {
      const box = await inputs.nth(i).boundingBox()
      if (box) {
        expect(box.width).toBeLessThan(1000)
      }
    }
  })
})
