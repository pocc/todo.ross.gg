import { type Component, For, Show, createEffect, onMount } from "solid-js"
import { useTerminal } from "~/context/terminal"
import { useLayout } from "~/context/layout"
import { Terminal } from "~/components/terminal"

export const TerminalPanel: Component = () => {
  const terminal = useTerminal()
  const layout = useLayout()

  onMount(() => {
    terminal.refresh()
  })

  function handleCreate() {
    terminal.create()
  }

  function handleClose(id: string, event: MouseEvent) {
    event.stopPropagation()
    terminal.close(id)
  }

  function handleTabClick(id: string) {
    terminal.setActive(id)
  }

  const activeSession = () => {
    const activeId = terminal.activeTerminal()
    if (!activeId) return null
    return terminal.sessions.find((s) => s.id === activeId) ?? null
  }

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        height: "100%",
        background: "var(--oc-bg-secondary)",
        "border-top": "1px solid var(--oc-border-primary)",
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          "align-items": "center",
          "border-bottom": "1px solid var(--oc-border-primary)",
          background: "var(--oc-surface-secondary)",
          "flex-shrink": "0",
          "min-height": "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            "align-items": "center",
            flex: "1",
            overflow: "auto",
            gap: "0",
          }}
        >
          <For each={terminal.sessions}>
            {(session) => {
              const isActive = () => terminal.activeTerminal() === session.id
              return (
                <div
                  onClick={() => handleTabClick(session.id)}
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "6px",
                    padding: "6px 12px",
                    "font-size": "12px",
                    "font-family": "var(--oc-font-sans)",
                    color: isActive() ? "var(--oc-text-primary)" : "var(--oc-text-tertiary)",
                    background: isActive() ? "var(--oc-bg-primary)" : "transparent",
                    "border-right": "1px solid var(--oc-border-primary)",
                    cursor: "pointer",
                    "white-space": "nowrap",
                    "user-select": "none",
                    transition: "background 100ms ease, color 100ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive()) {
                      (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive()) {
                      (e.currentTarget as HTMLElement).style.background = "transparent"
                    }
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ "flex-shrink": "0" }}>
                    <path d="M2 3.5l4.5 4.5-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <line x1="9" y1="12.5" x2="14" y2="12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                  <span>Terminal {session.id.slice(0, 6)}</span>
                  <div
                    onClick={(e) => handleClose(session.id, e)}
                    style={{
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "center",
                      width: "16px",
                      height: "16px",
                      "border-radius": "var(--oc-radius-sm)",
                      color: "var(--oc-text-tertiary)",
                      cursor: "pointer",
                      "flex-shrink": "0",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
                      ;(e.currentTarget as HTMLElement).style.color = "var(--oc-text-primary)"
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent"
                      ;(e.currentTarget as HTMLElement).style.color = "var(--oc-text-tertiary)"
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
        <button
          onClick={handleCreate}
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            width: "28px",
            height: "28px",
            margin: "0 4px",
            background: "transparent",
            border: "none",
            color: "var(--oc-text-tertiary)",
            cursor: "pointer",
            "border-radius": "var(--oc-radius-sm)",
            "flex-shrink": "0",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
            ;(e.currentTarget as HTMLElement).style.color = "var(--oc-text-primary)"
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent"
            ;(e.currentTarget as HTMLElement).style.color = "var(--oc-text-tertiary)"
          }}
          title="New Terminal"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      {/* Terminal content area */}
      <div style={{ flex: "1", overflow: "hidden" }}>
        <Show
          when={activeSession()}
          fallback={
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                height: "100%",
                color: "var(--oc-text-tertiary)",
                "font-size": "13px",
                "font-family": "var(--oc-font-sans)",
              }}
            >
              No terminals open
            </div>
          }
        >
          {(session) => (
            <Terminal ptyId={session().id} directory={session().directory} />
          )}
        </Show>
      </div>
    </div>
  )
}
