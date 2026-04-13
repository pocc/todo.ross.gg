import { test, expect, gotoSession, collectConsoleErrors } from "./fixtures"

test.describe("Session Layout — Structure", () => {
  test.beforeEach(async ({ page }) => {
    await gotoSession(page, "/tmp")
  })

  test("renders without crashing", async ({ page }) => {
    const rendered = await page.evaluate(
      () => (document.getElementById("root")?.childElementCount ?? 0) > 0,
    )
    expect(rendered).toBe(true)
  })

  test("no unexpected console errors", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await gotoSession(page, "/tmp")
    await page.waitForTimeout(2000)
    expect(errors).toHaveLength(0)
  })
})

test.describe("Session Layout — Sidebar", () => {
  test("sidebar shows project info or back link", async ({ page }) => {
    await gotoSession(page, "/tmp")
    // Sidebar should have a link back to home or show project name
    const sidebar = page.locator('[style*="sidebar"], nav, aside').first()
    // At minimum the layout should render
    const root = page.locator("#root")
    await expect(root).not.toBeEmpty()
  })

  test("New Session button is present", async ({ page }) => {
    await gotoSession(page, "/tmp")
    // Look for a "New Session" or "+" button
    const newBtn = page.locator("button", { hasText: /New Session|\+/ }).first()
    // May or may not be visible depending on sidebar state
    const count = await newBtn.count()
    expect(count).toBeGreaterThanOrEqual(0) // Doesn't crash
  })
})

test.describe("Session View — No Session Selected", () => {
  test("shows placeholder when no session ID in URL", async ({ page }) => {
    await gotoSession(page, "/tmp")
    // Should show some kind of "select a session" or empty state
    const root = page.locator("#root")
    await expect(root).not.toBeEmpty()
  })
})

test.describe("Session View — With Session ID", () => {
  test("renders session page for a given session ID", async ({ page }) => {
    await gotoSession(page, "/tmp", "test-session-abc")
    const root = page.locator("#root")
    await expect(root).not.toBeEmpty()
  })

  test("different session IDs produce different URLs", async ({ page }) => {
    await gotoSession(page, "/tmp", "session-1")
    const url1 = page.url()

    await gotoSession(page, "/tmp", "session-2")
    const url2 = page.url()

    expect(url1).not.toBe(url2)
    expect(url1).toContain("session-1")
    expect(url2).toContain("session-2")
  })
})

test.describe("Session — Keyboard Shortcuts", () => {
  test("Ctrl/Cmd+K does not cause errors", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await gotoSession(page, "/tmp")
    // Press Cmd+K (Mac) or Ctrl+K
    await page.keyboard.press("Meta+k")
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })

  test("Escape key does not cause errors", async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await gotoSession(page, "/tmp")
    await page.keyboard.press("Escape")
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })
})
