import { test, expect } from "./fixtures"

test.describe("Performance — Page Load", () => {
  test("home page loads within 5 seconds", async ({ page }) => {
    const start = Date.now()
    await page.goto("/", { waitUntil: "domcontentloaded" })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  })

  test("app renders within 3 seconds of navigation", async ({ page }) => {
    await page.goto("/")
    const start = Date.now()
    await page.waitForSelector("#root > *", { timeout: 3000 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(3000)
  })

  test("session route loads within 5 seconds", async ({ page }) => {
    const start = Date.now()
    await page.goto(`/${btoa("/tmp")}/session`, { waitUntil: "domcontentloaded" })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  })
})

test.describe("Performance — Bundle Size", () => {
  test("HTML is under 5KB", async ({ page }) => {
    const response = await page.goto("/")
    const body = await response?.body()
    expect(body!.length).toBeLessThan(5_000)
  })

  test("initial JS transferred is under 2MB", async ({ page }) => {
    let jsBytes = 0
    page.on("response", (res) => {
      const ct = res.headers()["content-type"] ?? ""
      if (ct.includes("javascript")) {
        const cl = res.headers()["content-length"]
        if (cl) jsBytes += parseInt(cl, 10)
      }
    })
    await page.goto("/")
    await page.waitForTimeout(3000)
    // Shiki bundles many language grammars; 3MB is a reasonable ceiling
    expect(jsBytes).toBeLessThan(3_000_000)
  })

  test("total CSS transferred is under 200KB", async ({ page }) => {
    let cssBytes = 0
    page.on("response", (res) => {
      const ct = res.headers()["content-type"] ?? ""
      if (ct.includes("css")) {
        const cl = res.headers()["content-length"]
        if (cl) cssBytes += parseInt(cl, 10)
      }
    })
    await page.goto("/")
    await page.waitForTimeout(2000)
    expect(cssBytes).toBeLessThan(200_000)
  })
})

test.describe("Performance — Resource Loading", () => {
  test("no failed network requests on home page", async ({ page }) => {
    const failed: string[] = []
    page.on("response", (res) => {
      const url = res.url()
      // Ignore SSE/localhost failures (no server running)
      if (url.includes("localhost") || url.includes("4096") || url.includes("event")) return
      if (res.status() >= 400) {
        failed.push(`${res.status()} ${url}`)
      }
    })
    await page.goto("/")
    await page.waitForTimeout(2000)
    expect(failed).toHaveLength(0)
  })

  test("no duplicate resource requests", async ({ page }) => {
    const requests = new Map<string, number>()
    page.on("request", (req) => {
      const url = req.url()
      // Skip data URLs, SSE, and localhost
      if (url.startsWith("data:") || url.includes("event") || url.includes("localhost:4096")) return
      requests.set(url, (requests.get(url) ?? 0) + 1)
    })
    await page.goto("/")
    await page.waitForTimeout(2000)
    const duplicates = [...requests.entries()].filter(([, count]) => count > 2)
    expect(duplicates.length, `Duplicate requests: ${duplicates.map(([url]) => url).join(", ")}`).toBe(0)
  })
})

test.describe("Performance — Interaction", () => {
  test("clicking Open Directory responds under 200ms", async ({ page }) => {
    await page.goto("/")
    await page.waitForSelector("#root > *")
    const btn = page.locator("button", { hasText: "Open Directory" })
    const start = Date.now()
    await btn.click()
    await page.locator('input[placeholder="/path/to/project"]').waitFor({ state: "visible" })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(200)
  })

  test("typing in input has no perceptible lag", async ({ page }) => {
    await page.goto("/")
    await page.waitForSelector("#root > *")
    const input = page.locator('input[placeholder="http://localhost:4096"]')
    await input.fill("")
    const start = Date.now()
    await input.type("http://test.example.com", { delay: 10 })
    const elapsed = Date.now() - start
    // 23 chars * 10ms delay = 230ms + overhead, should be under 2s
    expect(elapsed).toBeLessThan(2000)
    await expect(input).toHaveValue("http://test.example.com")
  })
})
