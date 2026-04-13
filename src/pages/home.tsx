import { Component, createSignal, Show, For } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { useServer } from "~/context/server"
import { Button } from "~/ui/components/button"

export const HomePage: Component = () => {
  const server = useServer()
  const navigate = useNavigate()

  const [urlInput, setUrlInput] = createSignal(server.serverUrl)
  const [dirInput, setDirInput] = createSignal("")
  const [showDirInput, setShowDirInput] = createSignal(false)
  const [connecting, setConnecting] = createSignal(false)

  async function handleConnect() {
    const url = urlInput().trim()
    if (!url) return
    setConnecting(true)
    try {
      await server.connect(url)
    } finally {
      setConnecting(false)
    }
  }

  function handleConnectKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") handleConnect()
  }

  function handleOpenDir() {
    const dir = dirInput().trim()
    if (!dir) return
    navigate(`/${btoa(dir)}/session`)
  }

  function handleDirKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") handleOpenDir()
  }

  function navigateToProject(worktree: string) {
    navigate(`/${btoa(worktree)}/session`)
  }

  function formatTime(iso: string): string {
    try {
      const d = new Date(iso)
      const now = Date.now()
      const diff = now - d.getTime()
      if (diff < 60_000) return "just now"
      if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
      if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
      return `${Math.floor(diff / 86_400_000)}d ago`
    } catch {
      return ""
    }
  }

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "min-height": "100%",
        padding: "48px 24px",
        background: "var(--oc-bg-primary)",
        overflow: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          gap: "16px",
          "margin-bottom": "40px",
        }}
      >
        {/* Logo icon area */}
        <div
          style={{
            width: "64px",
            height: "64px",
            "border-radius": "16px",
            background: "var(--oc-accent-primary)",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            "font-size": "28px",
            "font-weight": "700",
            color: "var(--oc-accent-text)",
            "font-family": "var(--oc-font-mono)",
          }}
        >
          {"</>"}
        </div>
        <h1
          style={{
            "font-size": "28px",
            "font-weight": "700",
            color: "var(--oc-text-primary)",
            "letter-spacing": "-0.5px",
          }}
        >
          OpenCode Web
        </h1>

        {/* Connection status */}
        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "8px",
            "font-size": "13px",
            color: "var(--oc-text-secondary)",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              "border-radius": "50%",
              background: server.connected
                ? "var(--oc-success)"
                : "var(--oc-error)",
              "box-shadow": server.connected
                ? "0 0 6px var(--oc-success)"
                : "0 0 6px var(--oc-error)",
            }}
          />
          <span>
            {server.connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Server URL connect */}
      <div
        style={{
          width: "100%",
          "max-width": "480px",
          "margin-bottom": "32px",
        }}
      >
        <label
          style={{
            display: "block",
            "font-size": "12px",
            "font-weight": "500",
            color: "var(--oc-text-tertiary)",
            "margin-bottom": "6px",
            "text-transform": "uppercase",
            "letter-spacing": "0.5px",
          }}
        >
          Server URL
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={urlInput()}
            onInput={(e) => setUrlInput(e.currentTarget.value)}
            onKeyDown={handleConnectKeyDown}
            placeholder="http://localhost:4096"
            style={{
              flex: "1",
              padding: "8px 12px",
              background: "var(--oc-surface-primary)",
              border: "1px solid var(--oc-border-primary)",
              "border-radius": "var(--oc-radius-md)",
              color: "var(--oc-text-primary)",
              "font-size": "13px",
              "font-family": "var(--oc-font-mono)",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--oc-border-focus)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--oc-border-primary)"
            }}
          />
          <Button
            variant="primary"
            size="md"
            loading={connecting()}
            onClick={handleConnect}
          >
            Connect
          </Button>
        </div>
        <Show when={server.error}>
          <p
            style={{
              "font-size": "12px",
              color: "var(--oc-error)",
              "margin-top": "6px",
            }}
          >
            {server.error}
          </p>
        </Show>
      </div>

      {/* Recent Projects */}
      <div
        style={{
          width: "100%",
          "max-width": "480px",
          "margin-bottom": "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
            "margin-bottom": "12px",
          }}
        >
          <h2
            style={{
              "font-size": "14px",
              "font-weight": "600",
              color: "var(--oc-text-secondary)",
              "text-transform": "uppercase",
              "letter-spacing": "0.5px",
            }}
          >
            Recent Projects
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDirInput(!showDirInput())}
          >
            Open Directory
          </Button>
        </div>

        {/* Open directory input */}
        <Show when={showDirInput()}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              "margin-bottom": "12px",
            }}
          >
            <input
              type="text"
              value={dirInput()}
              onInput={(e) => setDirInput(e.currentTarget.value)}
              onKeyDown={handleDirKeyDown}
              placeholder="/path/to/project"
              style={{
                flex: "1",
                padding: "8px 12px",
                background: "var(--oc-surface-primary)",
                border: "1px solid var(--oc-border-primary)",
                "border-radius": "var(--oc-radius-md)",
                color: "var(--oc-text-primary)",
                "font-size": "13px",
                "font-family": "var(--oc-font-mono)",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--oc-border-focus)"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--oc-border-primary)"
              }}
            />
            <Button variant="secondary" size="md" onClick={handleOpenDir}>
              Open
            </Button>
          </div>
        </Show>

        {/* Project list or empty state */}
        <Show
          when={server.projects.length > 0}
          fallback={
            <div
              style={{
                padding: "40px 20px",
                "text-align": "center",
                background: "var(--oc-surface-primary)",
                "border-radius": "var(--oc-radius-lg)",
                border: "1px solid var(--oc-border-primary)",
              }}
            >
              <div
                style={{
                  "font-size": "32px",
                  "margin-bottom": "12px",
                  opacity: "0.4",
                }}
              >
                {"{ }"}
              </div>
              <p
                style={{
                  "font-size": "14px",
                  color: "var(--oc-text-secondary)",
                  "margin-bottom": "4px",
                }}
              >
                No projects found
              </p>
              <p
                style={{
                  "font-size": "12px",
                  color: "var(--oc-text-tertiary)",
                }}
              >
                Connect to a server or open a directory to get started
              </p>
            </div>
          }
        >
          <div style={{ display: "flex", "flex-direction": "column", gap: "6px" }}>
            <For each={server.projects}>
              {(project) => (
                <button
                  onClick={() => navigateToProject(project.worktree)}
                  style={{
                    display: "flex",
                    "flex-direction": "column",
                    gap: "4px",
                    padding: "12px 14px",
                    background: "var(--oc-surface-primary)",
                    border: "1px solid var(--oc-border-primary)",
                    "border-radius": "var(--oc-radius-md)",
                    cursor: "pointer",
                    "text-align": "left",
                    transition: "background 120ms ease, border-color 120ms ease",
                    outline: "none",
                    width: "100%",
                    "font-family": "var(--oc-font-sans)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--oc-bg-hover)"
                    e.currentTarget.style.borderColor = "var(--oc-border-focus)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--oc-surface-primary)"
                    e.currentTarget.style.borderColor = "var(--oc-border-primary)"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--oc-border-focus)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "space-between",
                    }}
                  >
                    <span
                      style={{
                        "font-size": "14px",
                        "font-weight": "600",
                        color: "var(--oc-text-primary)",
                      }}
                    >
                      {project.name}
                    </span>
                    <Show when={project.git?.branch}>
                      <span
                        style={{
                          "font-size": "11px",
                          padding: "2px 8px",
                          "border-radius": "var(--oc-radius-sm)",
                          background: "var(--oc-accent-primary)",
                          color: "var(--oc-accent-text)",
                          "font-family": "var(--oc-font-mono)",
                          "font-weight": "500",
                        }}
                      >
                        {project.git!.branch}
                      </span>
                    </Show>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "space-between",
                    }}
                  >
                    <span
                      style={{
                        "font-size": "12px",
                        color: "var(--oc-text-tertiary)",
                        "font-family": "var(--oc-font-mono)",
                        overflow: "hidden",
                        "text-overflow": "ellipsis",
                        "white-space": "nowrap",
                        "max-width": "320px",
                      }}
                    >
                      {project.worktree}
                    </span>
                    <span
                      style={{
                        "font-size": "11px",
                        color: "var(--oc-text-tertiary)",
                        "flex-shrink": "0",
                        "margin-left": "8px",
                      }}
                    >
                      {formatTime(project.time.updated)}
                    </span>
                  </div>
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}
