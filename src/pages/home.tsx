import { Component, createSignal, Show, For, createEffect } from "solid-js"
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
  const [showSetup, setShowSetup] = createSignal(!server.connected)
  const [copied, setCopied] = createSignal(false)

  const serveCommand = () => `opencode serve --cors https://todo.ross.gg`

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

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(serveCommand())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may fail
    }
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

  // Hide setup once connected
  createEffect(() => {
    if (server.connected) setShowSetup(false)
  })

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
            {server.connected ? "Connected" : "Not connected"}
          </span>
          <Show when={!server.connected}>
            <button
              onClick={() => setShowSetup(!showSetup())}
              style={{
                background: "none",
                border: "none",
                color: "var(--oc-accent-primary)",
                cursor: "pointer",
                "font-size": "13px",
                "text-decoration": "underline",
                "text-underline-offset": "2px",
                padding: "0",
                "font-family": "var(--oc-font-sans)",
              }}
            >
              {showSetup() ? "Hide setup" : "Setup guide"}
            </button>
          </Show>
        </div>
      </div>

      {/* Setup Instructions */}
      <Show when={showSetup() && !server.connected}>
        <div
          style={{
            width: "100%",
            "max-width": "520px",
            "margin-bottom": "32px",
            padding: "20px",
            background: "var(--oc-surface-primary)",
            border: "1px solid var(--oc-border-primary)",
            "border-radius": "var(--oc-radius-lg)",
          }}
        >
          <h3
            style={{
              "font-size": "14px",
              "font-weight": "600",
              color: "var(--oc-text-primary)",
              "margin-bottom": "16px",
            }}
          >
            Quick Start
          </h3>

          {/* Step 1 */}
          <div style={{ "margin-bottom": "16px" }}>
            <div
              style={{
                display: "flex",
                "align-items": "center",
                gap: "8px",
                "margin-bottom": "8px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  "border-radius": "50%",
                  background: "var(--oc-accent-primary)",
                  color: "var(--oc-accent-text)",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  "font-size": "11px",
                  "font-weight": "700",
                  "flex-shrink": "0",
                }}
              >
                1
              </span>
              <span
                style={{
                  "font-size": "13px",
                  color: "var(--oc-text-secondary)",
                }}
              >
                Install OpenCode if you haven't already
              </span>
            </div>
            <div
              style={{
                "margin-left": "28px",
                padding: "8px 12px",
                background: "var(--oc-bg-primary)",
                "border-radius": "var(--oc-radius-md)",
                border: "1px solid var(--oc-border-secondary)",
                "font-family": "var(--oc-font-mono)",
                "font-size": "12px",
                color: "var(--oc-text-primary)",
              }}
            >
              npm i -g opencode
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ "margin-bottom": "16px" }}>
            <div
              style={{
                display: "flex",
                "align-items": "center",
                gap: "8px",
                "margin-bottom": "8px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  "border-radius": "50%",
                  background: "var(--oc-accent-primary)",
                  color: "var(--oc-accent-text)",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  "font-size": "11px",
                  "font-weight": "700",
                  "flex-shrink": "0",
                }}
              >
                2
              </span>
              <span
                style={{
                  "font-size": "13px",
                  color: "var(--oc-text-secondary)",
                }}
              >
                Start the server with CORS enabled for this site
              </span>
            </div>
            <div
              style={{
                "margin-left": "28px",
                display: "flex",
                "align-items": "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  flex: "1",
                  padding: "8px 12px",
                  background: "var(--oc-bg-primary)",
                  "border-radius": "var(--oc-radius-md)",
                  border: "1px solid var(--oc-border-secondary)",
                  "font-family": "var(--oc-font-mono)",
                  "font-size": "12px",
                  color: "var(--oc-text-primary)",
                  overflow: "hidden",
                  "text-overflow": "ellipsis",
                  "white-space": "nowrap",
                }}
              >
                {serveCommand()}
              </div>
              <button
                onClick={copyCommand}
                title="Copy to clipboard"
                style={{
                  padding: "6px 10px",
                  background: "var(--oc-bg-primary)",
                  border: "1px solid var(--oc-border-secondary)",
                  "border-radius": "var(--oc-radius-md)",
                  color: copied() ? "var(--oc-success)" : "var(--oc-text-secondary)",
                  cursor: "pointer",
                  "font-size": "12px",
                  "font-family": "var(--oc-font-sans)",
                  "white-space": "nowrap",
                  transition: "color 150ms ease",
                }}
              >
                {copied() ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ "margin-bottom": "8px" }}>
            <div
              style={{
                display: "flex",
                "align-items": "center",
                gap: "8px",
                "margin-bottom": "4px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  "border-radius": "50%",
                  background: "var(--oc-accent-primary)",
                  color: "var(--oc-accent-text)",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  "font-size": "11px",
                  "font-weight": "700",
                  "flex-shrink": "0",
                }}
              >
                3
              </span>
              <span
                style={{
                  "font-size": "13px",
                  color: "var(--oc-text-secondary)",
                }}
              >
                Click Connect below (default: http://localhost:4096)
              </span>
            </div>
          </div>

          {/* Note about auth */}
          <div
            style={{
              "margin-top": "16px",
              "padding-top": "12px",
              "border-top": "1px solid var(--oc-border-secondary)",
              "font-size": "12px",
              color: "var(--oc-text-tertiary)",
              "line-height": "1.5",
            }}
          >
            <strong style={{ color: "var(--oc-text-secondary)" }}>Optional:</strong>{" "}
            Protect your server with a password:
            <div
              style={{
                "margin-top": "6px",
                padding: "6px 10px",
                background: "var(--oc-bg-primary)",
                "border-radius": "var(--oc-radius-md)",
                border: "1px solid var(--oc-border-secondary)",
                "font-family": "var(--oc-font-mono)",
                "font-size": "11px",
                color: "var(--oc-text-primary)",
                "word-break": "break-all",
              }}
            >
              OPENCODE_SERVER_PASSWORD=secret opencode serve --cors https://todo.ross.gg
            </div>
          </div>
        </div>
      </Show>

      {/* Server URL connect */}
      <div
        style={{
          width: "100%",
          "max-width": "520px",
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
          "max-width": "520px",
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
                        "max-width": "360px",
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
