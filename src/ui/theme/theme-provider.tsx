import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  type ParentComponent,
} from "solid-js"
import type { ThemeMode } from "~/lib/types"
import type { ThemeDefinition } from "~/ui/theme/themes"
import { themes, themeMap } from "~/ui/theme/themes"
import { resolveThemeCSS, resolveMode } from "~/ui/theme/theme-resolver"

const STORAGE_KEY_MODE = "oc-theme-mode"
const STORAGE_KEY_THEME = "oc-theme-id"
const STYLE_ELEMENT_ID = "oc-theme"

interface ThemeContextValue {
  mode: () => ThemeMode
  setMode: (mode: ThemeMode) => void
  theme: () => ThemeDefinition
  setTheme: (id: string) => void
  themes: ThemeDefinition[]
  resolvedMode: () => "light" | "dark"
  previewTheme: (id: string) => void
  commitTheme: () => void
  cancelPreview: () => void
}

const ThemeContext = createContext<ThemeContextValue>()

function getStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MODE)
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return "system"
}

function getStoredThemeId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_THEME) ?? "default"
  } catch {
    return "default"
  }
}

function getOrCreateStyleElement(): HTMLStyleElement {
  let el = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement("style")
    el.id = STYLE_ELEMENT_ID
    document.head.appendChild(el)
  }
  return el
}

export const ThemeProvider: ParentComponent = (props) => {
  const [mode, setModeSignal] = createSignal<ThemeMode>(getStoredMode())
  const [themeId, setThemeIdSignal] = createSignal<string>(getStoredThemeId())
  const [previewId, setPreviewId] = createSignal<string | null>(null)
  const [resolved, setResolved] = createSignal<"light" | "dark">(
    resolveMode(getStoredMode())
  )

  const activeTheme = (): ThemeDefinition => {
    const id = previewId() ?? themeId()
    return themeMap.get(id) ?? themeMap.get("default")!
  }

  function applyTheme() {
    const currentMode = resolveMode(mode())
    setResolved(currentMode)
    const el = getOrCreateStyleElement()
    el.textContent = resolveThemeCSS(activeTheme(), currentMode)

    // Set data attribute for external CSS that keys off mode
    document.documentElement.setAttribute("data-theme-mode", currentMode)
    document.documentElement.setAttribute("data-theme", activeTheme().id)
  }

  // Persist mode changes
  function setMode(m: ThemeMode) {
    setModeSignal(m)
    try {
      localStorage.setItem(STORAGE_KEY_MODE, m)
    } catch {
      // ignore
    }
  }

  // Persist theme changes
  function setTheme(id: string) {
    if (!themeMap.has(id)) return
    setPreviewId(null)
    setThemeIdSignal(id)
    try {
      localStorage.setItem(STORAGE_KEY_THEME, id)
    } catch {
      // ignore
    }
  }

  // Preview without persisting
  function previewTheme(id: string) {
    if (themeMap.has(id)) {
      setPreviewId(id)
    }
  }

  // Commit preview to storage
  function commitTheme() {
    const pId = previewId()
    if (pId) {
      setTheme(pId)
    }
  }

  // Revert preview
  function cancelPreview() {
    setPreviewId(null)
  }

  // Listen for system color scheme changes when in "system" mode
  onMount(() => {
    applyTheme()

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (mode() === "system") {
        applyTheme()
      }
    }
    mediaQuery.addEventListener("change", handler)
    onCleanup(() => mediaQuery.removeEventListener("change", handler))
  })

  // Re-apply whenever mode, theme, or preview changes
  createEffect(() => {
    // Track reactive dependencies
    mode()
    themeId()
    previewId()
    applyTheme()
  })

  const value: ThemeContextValue = {
    mode,
    setMode,
    theme: activeTheme,
    setTheme,
    themes,
    resolvedMode: resolved,
    previewTheme,
    commitTheme,
    cancelPreview,
  }

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}
