import { Component, createSignal, Show, For } from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"
import { useServer } from "~/context/server"
import { useGlobalSync } from "~/context/global-sync"
import { useLayout } from "~/context/layout"
import { Button } from "~/ui/components/button"
import { Spinner } from "~/ui/components/spinner"
import { ThemeToggle } from "~/components/theme-toggle"

export const Sidebar: Component = () => {
  const params = useParams<{ dir: string; id?: string }>()
  const navigate = useNavigate()
  const server = useServer()
  const globalSync = useGlobalSync()
  const layout = useLayout()

  const [filter, setFilter] = createSignal("")
  const [creating, setCreating] = createSignal(false)

  const directory = () => {
    try {
      return atob(params.dir)
    } catch {
      return ""
    }
  }

  const projectName = () => {
    const dir = directory()
    const parts = dir.split("/")
    return parts[parts.length - 1] || dir
  }

  const sessions = () => {
    const dir = directory()
    const all = globalSync.sessions[dir] ?? []
    const f = filter().toLowerCase()
    if (!f) return all
    return all.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(f) ||
        s.id.toLowerCase().includes(f)
    )
  }

  async function handleNewSession() {
    setCreating(true)
    try {
      server.sdk.setDirectory(directory())
      const session = await server.sdk.createSession({})
      navigate(`/${params.dir}/session/${session.id}`)
    } catch {
      // session creation failed
    } finally {
      setCreating(false)
    }
  }

  function handleNavigateSession(sessionId: string) {
    navigate(`/${params.dir}/session/${sessionId}`)
  }

  function handleBackToHome() {
    navigate("/")
  }

  function formatTimeAgo(iso: string): string {
    try {
      const d = new Date(iso)
      const now = Date.now()
      const diff = now - d.getTime()
      if (diff < 60_000) return "now"
      if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
      if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
      return `${Math.floor(diff / 86_400_000)}d`
    } catch {
      return ""
    }
  }

  function statusColor(status: string): string {
    switch (status) {
      case "running":
        return "var(--oc-warning)"
      case "error":
        return "var(--oc-error)"
      default:
        return "var(--oc-text-tertiary)"
    }
  }

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        height: "100%",
        background: "var(--oc-bg-secondary)",
        "border-right": "1px solid var(--oc-border-primary)",
        overflow: "hidden",
      }}
    >
      {/* Project header */}
      <div
        style={{
          padding: "12px 12px 8px",
          "border-bottom": "1px solid var(--oc-border-secondary)",
          "flex-shrink": "0",
        }}
      >
        <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between", "margin-bottom": "6px" }}>
          <button
            onClick={handleBackToHome}
            style={{
              display: "flex",
              "align-items": "center",
              gap: "6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              color: "var(--oc-text-tertiary)",
              "font-size": "11px",
              "font-family": "var(--oc-font-sans)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--oc-text-primary)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--oc-text-tertiary)"
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            Home
          </button>
          <ThemeToggle />
        </div>
        <div
          style={{
            "font-size": "14px",
            "font-weight": "600",
            color: "var(--oc-text-primary)",
            overflow: "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
          }}
        >
          {projectName()}
        </div>
      </div>

      {/* New Session button */}
      <div style={{ padding: "8px 12px", "flex-shrink": "0" }}>
        <Button
          variant="primary"
          size="sm"
          loading={creating()}
          onClick={handleNewSession}
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Session
        </Button>
      </div>

      {/* Search filter */}
      <div style={{ padding: "0 12px 8px", "flex-shrink": "0" }}>
        <input
          type="text"
          value={filter()}
          onInput={(e) => setFilter(e.currentTarget.value)}
          placeholder="Filter sessions..."
          style={{
            width: "100%",
            padding: "6px 10px",
            background: "var(--oc-surface-primary)",
            border: "1px solid var(--oc-border-secondary)",
            "border-radius": "var(--oc-radius-sm)",
            color: "var(--oc-text-primary)",
            "font-size": "12px",
            "font-family": "var(--oc-font-sans)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--oc-border-focus)"
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--oc-border-secondary)"
          }}
        />
      </div>

      {/* Session list */}
      <div
        style={{
          flex: "1",
          "overflow-y": "auto",
          "overflow-x": "hidden",
          padding: "0 6px",
        }}
      >
        <Show
          when={sessions().length > 0}
          fallback={
            <div
              style={{
                padding: "24px 12px",
                "text-align": "center",
                "font-size": "12px",
                color: "var(--oc-text-tertiary)",
              }}
            >
              No sessions yet
            </div>
          }
        >
          <For each={sessions()}>
            {(session) => {
              const isActive = () => params.id === session.id
              return (
                <button
                  onClick={() => handleNavigateSession(session.id)}
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "8px",
                    width: "100%",
                    padding: "8px 10px",
                    background: isActive()
                      ? "var(--oc-bg-active)"
                      : "transparent",
                    border: "none",
                    "border-radius": "var(--oc-radius-sm)",
                    cursor: "pointer",
                    "text-align": "left",
                    transition: "background 100ms ease",
                    "font-family": "var(--oc-font-sans)",
                    "margin-bottom": "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive()) {
                      e.currentTarget.style.background = "var(--oc-bg-hover)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive()) {
                      e.currentTarget.style.background = "transparent"
                    }
                  }}
                >
                  {/* Status dot */}
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      "border-radius": "50%",
                      background: statusColor(session.status),
                      "flex-shrink": "0",
                    }}
                  />
                  {/* Title and time */}
                  <div
                    style={{
                      flex: "1",
                      "min-width": "0",
                      display: "flex",
                      "flex-direction": "column",
                      gap: "2px",
                    }}
                  >
                    <span
                      style={{
                        "font-size": "13px",
                        color: isActive()
                          ? "var(--oc-text-primary)"
                          : "var(--oc-text-secondary)",
                        "font-weight": isActive() ? "500" : "400",
                        overflow: "hidden",
                        "text-overflow": "ellipsis",
                        "white-space": "nowrap",
                      }}
                    >
                      {session.title || "Untitled"}
                    </span>
                  </div>
                  <span
                    style={{
                      "font-size": "11px",
                      color: "var(--oc-text-tertiary)",
                      "flex-shrink": "0",
                    }}
                  >
                    {formatTimeAgo(session.time.updated)}
                  </span>
                </button>
              )
            }}
          </For>
        </Show>
      </div>

      {/* Collapse button */}
      <div
        style={{
          padding: "8px 12px",
          "border-top": "1px solid var(--oc-border-secondary)",
          "flex-shrink": "0",
        }}
      >
        <button
          onClick={layout.toggleSidebar}
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            width: "100%",
            padding: "4px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--oc-text-tertiary)",
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
    </div>
  )
}
