import { createContext, useContext, type ParentComponent } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { createEffect } from "solid-js"
import { persist } from "~/lib/persist"
import { createLRUCache } from "~/lib/persist"
import type { LayoutState } from "~/lib/types"

interface ScrollPositions {
  [sessionId: string]: number
}

interface LayoutContextState {
  layout: LayoutState
  toggleSidebar: () => void
  toggleTerminal: () => void
  toggleReviewPanel: () => void
  toggleFileTree: () => void
  setSidebarWidth: (n: number) => void
  setTerminalHeight: (n: number) => void
  setReviewPanelWidth: (n: number) => void
  setFileTreeWidth: (n: number) => void
  getScrollPosition: (sessionId: string) => number
  setScrollPosition: (sessionId: string, position: number) => void
}

const LayoutContext = createContext<LayoutContextState>()

const DEFAULT_LAYOUT: LayoutState = {
  sidebarWidth: 260,
  sidebarCollapsed: false,
  terminalHeight: 300,
  terminalVisible: false,
  reviewPanelWidth: 400,
  reviewPanelVisible: false,
  fileTreeWidth: 240,
  fileTreeVisible: false,
}

export const LayoutProvider: ParentComponent = (props) => {
  const storage = persist<LayoutState>("layout.v2", DEFAULT_LAYOUT)
  const scrollCache = createLRUCache<number>("layout.scroll", 50)

  const [layout, setLayout] = createStore<LayoutState>(storage.get())

  createEffect(() => {
    storage.set({ ...layout })
  })

  function toggleSidebar() {
    setLayout("sidebarCollapsed", (v) => !v)
  }

  function toggleTerminal() {
    setLayout("terminalVisible", (v) => !v)
  }

  function toggleReviewPanel() {
    setLayout("reviewPanelVisible", (v) => !v)
  }

  function toggleFileTree() {
    setLayout("fileTreeVisible", (v) => !v)
  }

  function setSidebarWidth(n: number) {
    setLayout("sidebarWidth", n)
  }

  function setTerminalHeight(n: number) {
    setLayout("terminalHeight", n)
  }

  function setReviewPanelWidth(n: number) {
    setLayout("reviewPanelWidth", n)
  }

  function setFileTreeWidth(n: number) {
    setLayout("fileTreeWidth", n)
  }

  function getScrollPosition(sessionId: string): number {
    return scrollCache.get(sessionId) ?? 0
  }

  function setScrollPosition(sessionId: string, position: number) {
    scrollCache.set(sessionId, position)
  }

  const state: LayoutContextState = {
    get layout() {
      return layout
    },
    toggleSidebar,
    toggleTerminal,
    toggleReviewPanel,
    toggleFileTree,
    setSidebarWidth,
    setTerminalHeight,
    setReviewPanelWidth,
    setFileTreeWidth,
    getScrollPosition,
    setScrollPosition,
  }

  return (
    <LayoutContext.Provider value={state}>
      {props.children}
    </LayoutContext.Provider>
  )
}

export function useLayout(): LayoutContextState {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider")
  return ctx
}
