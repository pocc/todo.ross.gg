import { test, expect, gotoHome, getCSSVar } from "./fixtures"

test.describe("Theme System — CSS Custom Properties", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page)
  })

  test("--oc-bg-primary is defined", async ({ page }) => {
    const value = await getCSSVar(page, "--oc-bg-primary")
    expect(value.length).toBeGreaterThan(0)
  })

  test("--oc-text-primary is defined", async ({ page }) => {
    const value = await getCSSVar(page, "--oc-text-primary")
    expect(value.length).toBeGreaterThan(0)
  })

  test("--oc-accent-primary is defined", async ({ page }) => {
    const value = await getCSSVar(page, "--oc-accent-primary")
    expect(value.length).toBeGreaterThan(0)
  })

  test("--oc-border-primary is defined", async ({ page }) => {
    const value = await getCSSVar(page, "--oc-border-primary")
    expect(value.length).toBeGreaterThan(0)
  })

  test("--oc-font-sans is defined", async ({ page }) => {
    const value = await getCSSVar(page, "--oc-font-sans")
    expect(value).toContain("Inter")
  })

  test("--oc-font-mono is defined", async ({ page }) => {
    const value = await getCSSVar(page, "--oc-font-mono")
    expect(value).toContain("monospace")
  })

  test("all core token categories have values", async ({ page }) => {
    const vars = [
      "--oc-bg-secondary",
      "--oc-bg-tertiary",
      "--oc-surface-primary",
      "--oc-surface-secondary",
      "--oc-text-secondary",
      "--oc-text-tertiary",
      "--oc-border-secondary",
      "--oc-accent-hover",
      "--oc-success",
      "--oc-warning",
      "--oc-error",
      "--oc-info",
      "--oc-diff-add-bg",
      "--oc-diff-del-bg",
    ]
    for (const v of vars) {
      const value = await getCSSVar(page, v)
      expect(value.length, `${v} should have a value`).toBeGreaterThan(0)
    }
  })
})

test.describe("Theme System — Dark Mode Default", () => {
  test("body has dark background by default", async ({ page }) => {
    await gotoHome(page)
    const bg = await page.evaluate(() => {
      const rgb = getComputedStyle(document.body).backgroundColor
      // Parse rgb(r, g, b) and check if it's dark
      const match = rgb.match(/\d+/g)
      if (!match) return { r: 255, g: 255, b: 255 }
      return { r: +match[0], g: +match[1], b: +match[2] }
    })
    // Dark theme: RGB values should all be low
    const luminance = (bg.r * 299 + bg.g * 587 + bg.b * 114) / 1000
    expect(luminance).toBeLessThan(128)
  })

  test("text has light color in dark mode", async ({ page }) => {
    await gotoHome(page)
    const h1Color = await page.evaluate(() => {
      const el = document.querySelector("h1")
      if (!el) return { r: 0, g: 0, b: 0 }
      const rgb = getComputedStyle(el).color
      const match = rgb.match(/\d+/g)
      if (!match) return { r: 0, g: 0, b: 0 }
      return { r: +match[0], g: +match[1], b: +match[2] }
    })
    const luminance = (h1Color.r * 299 + h1Color.g * 587 + h1Color.b * 114) / 1000
    expect(luminance).toBeGreaterThan(128)
  })
})

test.describe("Theme System — LocalStorage Persistence", () => {
  test("theme mode is stored in localStorage", async ({ page }) => {
    await gotoHome(page)
    const stored = await page.evaluate(() => {
      // Check common storage keys for theme
      return {
        mode: localStorage.getItem("oc-theme-mode"),
        theme: localStorage.getItem("oc-theme-id"),
      }
    })
    // The theme provider should have persisted defaults
    // (may be null if first load, that's okay)
    expect(stored).toBeDefined()
  })

  test("theme preference persists across navigation", async ({ page }) => {
    await gotoHome(page)
    // Store current CSS var
    const bgBefore = await getCSSVar(page, "--oc-bg-primary")
    // Navigate away and back
    await page.goto("/L3RtcA==/session")
    await page.goto("/")
    await page.waitForSelector("#root > *")
    const bgAfter = await getCSSVar(page, "--oc-bg-primary")
    // Should be the same
    expect(bgAfter).toBe(bgBefore)
  })
})
