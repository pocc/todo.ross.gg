import { type Component, createSignal, onMount, onCleanup, Show } from "solid-js"
import { useServer } from "~/context/server"
import { useTerminal } from "~/context/terminal"
import { useGlobalSync } from "~/context/global-sync"

export const DebugBar: Component = () => {
  const server = useServer()
  const terminal = useTerminal()
  const globalSync = useGlobalSync()

  const [visible, setVisible] = createSignal(false)
  const [eventCount, setEventCount] = createSignal(0)

  function handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key === "D") {
      event.preventDefault()
      setVisible((v) => !v)
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown)
    onCleanup(() => document.removeEventListener("keydown", handleKeyDown))
  })

  const sessionCount = () => {
    let count = 0
    for (const dir of Object.keys(globalSync.sessions)) {
      count += globalSync.sessions[dir]?.length ?? 0
    }
    return count
  }

  const activeDirectory = () => {
    const projects = globalSync.projects
    if (projects.length > 0) return projects[0].worktree
    return "N/A"
  }

  const itemStyle = {
    display: "flex",
    "align-items": "center",
    gap: "4px",
    "white-space": "nowrap" as const,
  }

  const labelStyle = {
    color: "var(--oc-text-tertiary)",
  }

  const valueStyle = {
    color: "var(--oc-text-primary)",
    "font-family": "var(--oc-font-mono)",
  }

  return (
    <Show when={visible()}>
      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          right: "0",
          "z-index": "3000",
          display: "flex",
          "align-items": "center",
          gap: "16px",
          padding: "4px 12px",
          "font-size": "11px",
          background: "var(--oc-bg-elevated)",
          "border-top": "1px solid var(--oc-border-primary)",
          "box-shadow": "0 -2px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <span
          style={{
            "font-weight": "600",
            color: "var(--oc-accent-primary)",
            "text-transform": "uppercase",
            "letter-spacing": "0.05em",
          }}
        >
          Debug
        </span>

        <div style={itemStyle}>
          <span style={labelStyle}>Server:</span>
          <span style={valueStyle}>{server.serverUrl}</span>
        </div>

        <div style={itemStyle}>
          <span style={labelStyle}>Status:</span>
          <span
            style={{
              color: server.connected ? "var(--oc-success)" : "var(--oc-error)",
            }}
          >
            {server.connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div style={itemStyle}>
          <span style={labelStyle}>Directory:</span>
          <span
            style={{
              ...valueStyle,
              "max-width": "200px",
              overflow: "hidden",
              "text-overflow": "ellipsis",
            }}
          >
            {activeDirectory()}
          </span>
        </div>

        <div style={itemStyle}>
          <span style={labelStyle}>Sessions:</span>
          <span style={valueStyle}>{sessionCount()}</span>
        </div>

        <div style={itemStyle}>
          <span style={labelStyle}>Terminals:</span>
          <span style={valueStyle}>{terminal.sessions.length}</span>
        </div>

        <div style={{ "margin-left": "auto" }}>
          <button
            onClick={() => setVisible(false)}
            style={{
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              padding: "2px 6px",
              background: "transparent",
              border: "none",
              color: "var(--oc-text-tertiary)",
              cursor: "pointer",
              "font-size": "11px",
              "font-family": "var(--oc-font-sans)",
              "border-radius": "var(--oc-radius-sm)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent"
            }}
          >
            Close (Ctrl+Shift+D)
          </button>
        </div>
      </div>
    </Show>
  )
}
