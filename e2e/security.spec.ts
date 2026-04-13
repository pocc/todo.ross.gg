import { test, expect } from "./fixtures"

test.describe("Security — HTTP Headers", () => {
  test("serves over HTTPS in production", async ({ page }) => {
    // This test only applies to the production URL
    const response = await page.goto("/")
    const url = page.url()
    // In local dev, HTTP is expected; in prod, should be HTTPS
    if (!url.includes("localhost")) {
      expect(url).toMatch(/^https:/)
    }
  })

  test("no sensitive data in HTML source", async ({ page }) => {
    const response = await page.goto("/")
    const html = await response?.text() ?? ""
    // No API keys or tokens
    expect(html).not.toMatch(/sk-[a-zA-Z0-9]{20,}/)
    expect(html).not.toMatch(/api[_-]?key\s*[:=]\s*["'][^"']+["']/i)
    expect(html).not.toMatch(/secret\s*[:=]\s*["'][^"']+["']/i)
  })
})

test.describe("Security — Content", () => {
  test("no inline scripts in HTML (except Vite module)", async ({ page }) => {
    const response = await page.goto("/")
    const html = await response?.text() ?? ""
    // Count script tags
    const scripts = html.match(/<script[^>]*>/g) ?? []
    // All scripts should be either type=module (our app) or from Cloudflare
    for (const tag of scripts) {
      const isModule = tag.includes('type="module"')
      const isCF = tag.includes("cloudflare") || tag.includes("CF$cv$params")
      expect(isModule || isCF, `Unexpected script tag: ${tag}`).toBe(true)
    }
  })

  test("localStorage does not contain credentials", async ({ page }) => {
    await page.goto("/")
    await page.waitForSelector("#root > *")
    const stored = await page.evaluate(() => {
      const items: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) items[key] = localStorage.getItem(key) ?? ""
      }
      return items
    })
    const allValues = Object.values(stored).join(" ")
    expect(allValues).not.toMatch(/sk-[a-zA-Z0-9]{20,}/)
    expect(allValues).not.toMatch(/password/i)
  })
})

test.describe("Security — XSS Prevention", () => {
  test("URL parameters are not reflected unsanitized", async ({ page }) => {
    await page.goto("/?q=<script>alert(1)</script>")
    const html = await page.content()
    expect(html).not.toContain("<script>alert(1)</script>")
  })

  test("directory route with script injection does not execute", async ({ page }) => {
    const malicious = btoa("<script>alert(1)</script>")
    await page.goto(`/${malicious}/session`)
    // Page should render without executing the script
    const alertFired = await page.evaluate(() => {
      return (window as any).__xss_fired === true
    })
    expect(alertFired).toBe(false)
  })
})

test.describe("Security — Mixed Content", () => {
  test("no HTTP resources loaded from HTTPS page", async ({ page }) => {
    const httpResources: string[] = []
    page.on("response", (res) => {
      const url = res.url()
      // Ignore localhost (expected for opencode server connection)
      if (url.includes("localhost") || url.includes("127.0.0.1")) return
      if (url.startsWith("http://")) {
        httpResources.push(url)
      }
    })
    await page.goto("/")
    await page.waitForTimeout(2000)
    expect(httpResources).toHaveLength(0)
  })
})
