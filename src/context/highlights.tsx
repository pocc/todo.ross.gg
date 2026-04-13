import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal } from "solid-js"
import type { Highlighter } from "shiki"

interface HighlightsContextState {
  highlight: (code: string, lang: string) => Promise<string>
  getHighlighter: () => Promise<Highlighter>
}

const HighlightsContext = createContext<HighlightsContextState>()

function hashKey(code: string, lang: string): string {
  let hash = 0
  const str = `${lang}:${code}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash.toString(36)
}

export const HighlightsProvider: ParentComponent = (props) => {
  let highlighterPromise: Promise<Highlighter> | null = null
  const cache = new Map<string, string>()

  async function initHighlighter(): Promise<Highlighter> {
    if (highlighterPromise) return highlighterPromise

    highlighterPromise = (async () => {
      const { createHighlighter } = await import("shiki")
      const instance = await createHighlighter({
        themes: ["github-dark", "github-light"],
        langs: [
          "typescript",
          "javascript",
          "tsx",
          "jsx",
          "json",
          "html",
          "css",
          "python",
          "rust",
          "go",
          "bash",
          "shell",
          "markdown",
          "yaml",
          "toml",
          "sql",
          "diff",
          "xml",
          "c",
          "cpp",
          "java",
        ],
      })
      return instance
    })()

    return highlighterPromise
  }

  async function getHighlighterInstance(): Promise<Highlighter> {
    return initHighlighter()
  }

  async function highlight(code: string, lang: string): Promise<string> {
    const key = hashKey(code, lang)
    const cached = cache.get(key)
    if (cached) return cached

    try {
      const highlighter = await initHighlighter()
      const loadedLangs = highlighter.getLoadedLanguages()
      const targetLang = loadedLangs.includes(lang as never) ? lang : "text"

      const html = highlighter.codeToHtml(code, {
        lang: targetLang,
        theme: "github-dark",
      })

      cache.set(key, html)

      if (cache.size > 500) {
        const firstKey = cache.keys().next().value
        if (firstKey !== undefined) cache.delete(firstKey)
      }

      return html
    } catch {
      return `<pre><code>${escapeHtml(code)}</code></pre>`
    }
  }

  const state: HighlightsContextState = {
    highlight,
    getHighlighter: getHighlighterInstance,
  }

  return (
    <HighlightsContext.Provider value={state}>
      {props.children}
    </HighlightsContext.Provider>
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function useHighlights(): HighlightsContextState {
  const ctx = useContext(HighlightsContext)
  if (!ctx) throw new Error("useHighlights must be used within HighlightsProvider")
  return ctx
}
