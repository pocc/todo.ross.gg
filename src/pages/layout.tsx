import { Component, onMount, onCleanup, Show } from "solid-js"
import { useParams } from "@solidjs/router"
import { useServer } from "~/context/server"
import { useGlobalSync } from "~/context/global-sync"
import { useLayout } from "~/context/layout"
import { Sidebar } from "~/pages/layout/sidebar"
import { TodosPage } from "~/pages/todos"

const TabBarButton: Component<{ label: string; active: boolean; onClick: () => void }> = (props) => (
  <button
    onClick={props.onClick}
    style={{
      padding: "6px 16px",
      "font-size": "13px",
      "font-family": "var(--oc-font-sans)",
      "font-weight": "500",
      color: props.active ? "var(--oc-text-primary)" : "var(--oc-text-tertiary)",
      background: "transparent",
      border: "none",
      "border-bottom": props.active ? "2px solid var(--oc-accent-primary)" : "2px solid transparent",
      cursor: "pointer",
      transition: "color 150ms ease, border-color 150ms ease",
      outline: "none",
    }}
    onMouseEnter={(e) => {
      if (!props.active) e.currentTarget.style.color = "var(--oc-text-secondary)"
    }}
    onMouseLeave={(e) => {
      if (!props.active) e.currentTarget.style.color = "var(--oc-text-tertiary)"
    }}
  >
    {props.label}
  </button>
)

export const AppLayout: Component<{ children?: any }> = (props) => {
  const params = useParams<{ dir: string }>()
  const server = useServer()
  const globalSync = useGlobalSync()
  const layout = useLayout()

  const directory = () => {
    try {
      return atob(params.dir)
    } catch {
      return ""
    }
  }

  let dragStartX = 0
  let dragStartWidth = 0
  let isDraggingSidebar = false

  let dragStartY = 0
  let dragStartHeight = 0
  let isDraggingTerminal = false

  onMount(() => {
    const dir = directory()
    if (dir) {
      server.sdk.setDirectory(dir)
      globalSync.loadSessions(dir)
    }
  })

  function handleKeyDown(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key === "b") {
      e.preventDefault()
      layout.toggleSidebar()
    }
    if (mod && e.key === "j") {
      e.preventDefault()
      layout.toggleTerminal()
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown)
  })

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown)
  })

  // Sidebar drag resize
  function handleSidebarDragStart(e: MouseEvent) {
    e.preventDefault()
    isDraggingSidebar = true
    dragStartX = e.clientX
    dragStartWidth = layout.layout.sidebarWidth
    document.addEventListener("mousemove", handleSidebarDrag)
    document.addEventListener("mouseup", handleSidebarDragEnd)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  function handleSidebarDrag(e: MouseEvent) {
    if (!isDraggingSidebar) return
    const delta = e.clientX - dragStartX
    const newWidth = Math.max(180, Math.min(500, dragStartWidth + delta))
    layout.setSidebarWidth(newWidth)
  }

  function handleSidebarDragEnd() {
    isDraggingSidebar = false
    document.removeEventListener("mousemove", handleSidebarDrag)
    document.removeEventListener("mouseup", handleSidebarDragEnd)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }

  // Terminal drag resize
  function handleTerminalDragStart(e: MouseEvent) {
    e.preventDefault()
    isDraggingTerminal = true
    dragStartY = e.clientY
    dragStartHeight = layout.layout.terminalHeight
    document.addEventListener("mousemove", handleTerminalDrag)
    document.addEventListener("mouseup", handleTerminalDragEnd)
    document.body.style.cursor = "row-resize"
    document.body.style.userSelect = "none"
  }

  function handleTerminalDrag(e: MouseEvent) {
    if (!isDraggingTerminal) return
    const delta = dragStartY - e.clientY
    const newHeight = Math.max(100, Math.min(600, dragStartHeight + delta))
    layout.setTerminalHeight(newHeight)
  }

  function handleTerminalDragEnd() {
    isDraggingTerminal = false
    document.removeEventListener("mousemove", handleTerminalDrag)
    document.removeEventListener("mouseup", handleTerminalDragEnd)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "var(--oc-bg-primary)",
      }}
    >
      {/* Sidebar */}
      <Show when={!layout.layout.sidebarCollapsed}>
        <div
          class="app-sidebar"
          style={{
            width: `${layout.layout.sidebarWidth}px`,
            "flex-shrink": "0",
            height: "100%",
            position: "relative",
          }}
        >
          <Sidebar />
          {/* Sidebar resize handle */}
          <div
            class="app-sidebar-resize"
            onMouseDown={handleSidebarDragStart}
            style={{
              position: "absolute",
              top: "0",
              right: "-2px",
              width: "4px",
              height: "100%",
              cursor: "col-resize",
              "z-index": "10",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--oc-accent-primary)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          />
        </div>
      </Show>

      {/* Collapsed sidebar toggle */}
      <Show when={layout.layout.sidebarCollapsed}>
        <div
          class="app-sidebar-collapsed"
          style={{
            width: "40px",
            "flex-shrink": "0",
            height: "100%",
            background: "var(--oc-bg-secondary)",
            "border-right": "1px solid var(--oc-border-primary)",
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            "padding-top": "10px",
          }}
        >
          <button
            onClick={layout.toggleSidebar}
            style={{
              width: "28px",
              height: "28px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--oc-text-tertiary)",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "border-radius": "var(--oc-radius-sm)",
              transition: "background 100ms ease, color 100ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--oc-bg-hover)"
              e.currentTarget.style.color = "var(--oc-text-primary)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none"
              e.currentTarget.style.color = "var(--oc-text-tertiary)"
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>
      </Show>

      {/* Main content area */}
      <div
        style={{
          flex: "1",
          display: "flex",
          "flex-direction": "column",
          "min-width": "0",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "border-bottom": "1px solid var(--oc-border-primary)",
            "flex-shrink": "0",
            background: "var(--oc-bg-secondary)",
            padding: "0 8px",
          }}
        >
          <TabBarButton
            label="Todos"
            active={layout.layout.activeTab === "todos"}
            onClick={() => layout.setActiveTab("todos")}
          />
          <TabBarButton
            label="Chats"
            active={layout.layout.activeTab === "chats"}
            onClick={() => layout.setActiveTab("chats")}
          />
        </div>

        {/* Main content */}
        <div
          style={{
            flex: "1",
            "min-height": "0",
            overflow: "auto",
          }}
        >
          <Show when={layout.layout.activeTab === "chats"} fallback={<TodosPage />}>
            {props.children}
          </Show>
        </div>

        {/* Terminal panel */}
        <Show when={layout.layout.terminalVisible}>
          {/* Terminal resize handle */}
          <div
            onMouseDown={handleTerminalDragStart}
            style={{
              height: "4px",
              cursor: "row-resize",
              "flex-shrink": "0",
              "border-top": "1px solid var(--oc-border-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--oc-accent-primary)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          />
          <div
            style={{
              height: `${layout.layout.terminalHeight}px`,
              "flex-shrink": "0",
              background: "var(--oc-bg-secondary)",
              overflow: "hidden",
              display: "flex",
              "flex-direction": "column",
            }}
          >
            {/* Terminal header */}
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                padding: "6px 12px",
                "border-bottom": "1px solid var(--oc-border-secondary)",
                "flex-shrink": "0",
              }}
            >
              <span
                style={{
                  "font-size": "12px",
                  "font-weight": "500",
                  color: "var(--oc-text-secondary)",
                  "text-transform": "uppercase",
                  "letter-spacing": "0.5px",
                }}
              >
                Terminal
              </span>
              <button
                onClick={layout.toggleTerminal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--oc-text-tertiary)",
                  padding: "2px",
                  display: "flex",
                  "align-items": "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--oc-text-primary)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--oc-text-tertiary)"
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* Terminal content placeholder */}
            <div
              style={{
                flex: "1",
                padding: "12px",
                "font-family": "var(--oc-font-mono)",
                "font-size": "13px",
                color: "var(--oc-text-tertiary)",
                overflow: "auto",
              }}
            >
              Terminal session will render here
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}
