import { test as base, expect, type Page } from "@playwright/test"

/** Expected console errors when no opencode server is running */
const EXPECTED_ERROR_PATTERNS = [
  "localhost",
  "4096",
  "Failed to fetch",
  "EventSource",
  "text/event-stream",
  "NetworkError",
  "net::ERR",
  "NS_ERROR",
]

function isExpectedError(msg: string): boolean {
  return EXPECTED_ERROR_PATTERNS.some((p) => msg.includes(p))
}

/** Collect unexpected console errors on a page */
export function collectConsoleErrors(page: Page) {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error" && !isExpectedError(msg.text())) {
      errors.push(msg.text())
    }
  })
  return errors
}

/** Navigate to home and wait for SolidJS to render */
export async function gotoHome(page: Page) {
  await page.goto("/")
  await page.waitForSelector("#root > *")
}

/** Navigate to a directory session route */
export async function gotoSession(page: Page, dir = "/tmp", sessionId?: string) {
  const encoded = btoa(dir)
  const path = sessionId
    ? `/${encoded}/session/${sessionId}`
    : `/${encoded}/session`
  await page.goto(path)
  await page.waitForSelector("#root > *")
}

/** Get a CSS custom property value from :root */
export async function getCSSVar(page: Page, varName: string): Promise<string> {
  return page.evaluate(
    (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    varName,
  )
}

/** Check that a network request returned a specific status */
export async function expectAssetStatus(page: Page, path: string, status: number) {
  const response = await page.goto(path)
  expect(response?.status()).toBe(status)
  return response
}

export { base as test, expect }
