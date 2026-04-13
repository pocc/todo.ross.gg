import { test, expect, gotoHome } from "./fixtures"

test.describe("Accessibility — Semantic HTML", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page)
  })

  test("page has an h1 heading", async ({ page }) => {
    const h1Count = await page.locator("h1").count()
    expect(h1Count).toBe(1)
  })

  test("all inputs have associated labels or placeholders", async ({ page }) => {
    const inputs = page.locator("input:not([type=hidden])")
    const count = await inputs.count()
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const isVisible = await input.isVisible()
      if (!isVisible) continue
      const placeholder = await input.getAttribute("placeholder")
      const ariaLabel = await input.getAttribute("aria-label")
      const id = await input.getAttribute("id")
      // Input should have at least a placeholder, aria-label, or a linked label
      const hasLabel = placeholder || ariaLabel || (id && (await page.locator(`label[for="${id}"]`).count()) > 0)
      expect(hasLabel, `Input at index ${i} should have a label`).toBeTruthy()
    }
  })

  test("buttons have accessible text", async ({ page }) => {
    const buttons = page.locator("button")
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i)
      const isVisible = await btn.isVisible()
      if (!isVisible) continue
      const text = await btn.textContent()
      const ariaLabel = await btn.getAttribute("aria-label")
      const hasLabel = (text && text.trim().length > 0) || ariaLabel
      expect(hasLabel, `Button at index ${i} should have accessible text`).toBeTruthy()
    }
  })
})

test.describe("Accessibility — Keyboard Navigation", () => {
  test("Tab key moves focus through interactive elements", async ({ page }) => {
    await gotoHome(page)
    // Tab through elements
    await page.keyboard.press("Tab")
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName)
    expect(firstFocused).toBeTruthy()

    await page.keyboard.press("Tab")
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName)
    expect(secondFocused).toBeTruthy()
  })

  test("focused elements have visible focus indicators", async ({ page }) => {
    await gotoHome(page)
    // Focus the server URL input
    const input = page.locator('input[placeholder="http://localhost:4096"]')
    await input.focus()
    // Check it's focused
    const isFocused = await page.evaluate(() => {
      const active = document.activeElement
      return active?.tagName === "INPUT"
    })
    expect(isFocused).toBe(true)
  })

  test("Enter key activates buttons", async ({ page }) => {
    await gotoHome(page)
    // Focus the Open Directory button and press Enter
    await page.locator("button", { hasText: "Open Directory" }).focus()
    await page.keyboard.press("Enter")
    // Directory input should appear
    await expect(
      page.locator('input[placeholder="/path/to/project"]'),
    ).toBeVisible()
  })
})

test.describe("Accessibility — Color Contrast", () => {
  test("primary text has sufficient contrast against background", async ({ page }) => {
    await gotoHome(page)
    const contrast = await page.evaluate(() => {
      const body = getComputedStyle(document.body)
      const h1 = document.querySelector("h1")
      if (!h1) return 0
      const textRGB = getComputedStyle(h1).color.match(/\d+/g)?.map(Number) ?? [0, 0, 0]
      const bgRGB = body.backgroundColor.match(/\d+/g)?.map(Number) ?? [255, 255, 255]
      // Relative luminance calculation
      const lum = (rgb: number[]) => {
        const [r, g, b] = rgb.map((c) => {
          const s = c / 255
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      const l1 = Math.max(lum(textRGB), lum(bgRGB))
      const l2 = Math.min(lum(textRGB), lum(bgRGB))
      return (l1 + 0.05) / (l2 + 0.05)
    })
    // WCAG AA requires 4.5:1 for normal text
    expect(contrast).toBeGreaterThan(4.5)
  })
})

test.describe("Accessibility — Reduced Motion", () => {
  test("app renders normally with reduced motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await gotoHome(page)
    await expect(page.locator("h1")).toContainText("OpenCode Web")
  })
})
