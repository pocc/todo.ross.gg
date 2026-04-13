import { type Component, createSignal, For, Show, onMount, createMemo } from "solid-js"
import { Dialog } from "~/ui/components/dialog"
import { Button } from "~/ui/components/button"

export interface SelectDirectoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (path: string) => void
}

const RECENT_DIRS_KEY = "oc-recent-directories"
const MAX_RECENT = 10

function getRecentDirectories(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_DIRS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

function saveRecentDirectory(path: string) {
  try {
    const recent = getRecentDirectories().filter((d) => d !== path)
    recent.unshift(path)
    localStorage.setItem(RECENT_DIRS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch {
    // ignore
  }
}

export const SelectDirectoryDialog: Component<SelectDirectoryDialogProps> = (props) => {
  const [path, setPath] = createSignal("")
  const [recent, setRecent] = createSignal<string[]>([])
  const [error, setError] = createSignal("")

  onMount(() => {
    setRecent(getRecentDirectories())
  })

  function handleOpen() {
    const trimmed = path().trim()
    if (!trimmed) {
      setError("Please enter a directory path")
      return
    }
    if (!trimmed.startsWith("/") && !trimmed.startsWith("~")) {
      setError("Path must be absolute (start with / or ~)")
      return
    }
    setError("")
    saveRecentDirectory(trimmed)
    props.onSelect(trimmed)
    props.onOpenChange(false)
    setPath("")
  }

  function handleSelectRecent(dir: string) {
    setPath(dir)
    saveRecentDirectory(dir)
    props.onSelect(dir)
    props.onOpenChange(false)
    setPath("")
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault()
      handleOpen()
    }
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          setPath("")
          setError("")
        }
        props.onOpenChange(open)
      }}
      title="Select Directory"
      description="Enter the path to a project directory."
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={path()}
            onInput={(e) => {
              setPath((e.currentTarget as HTMLInputElement).value)
              setError("")
            }}
            onKeyDown={handleKeyDown}
            placeholder="/path/to/project"
            autofocus
            style={{
              flex: "1",
              padding: "8px 10px",
              "font-size": "13px",
              "font-family": "var(--oc-font-mono)",
              color: "var(--oc-text-primary)",
              background: "var(--oc-surface-primary)",
              border: `1px solid ${error() ? "var(--oc-error)" : "var(--oc-border-primary)"}`,
              "border-radius": "var(--oc-radius-md)",
              outline: "none",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--oc-border-focus)"
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = error() ? "var(--oc-error)" : "var(--oc-border-primary)"
            }}
          />
          <Button variant="primary" onClick={handleOpen}>
            Open
          </Button>
        </div>

        <Show when={error()}>
          <div style={{ "font-size": "12px", color: "var(--oc-error)" }}>
            {error()}
          </div>
        </Show>

        <Show when={recent().length > 0}>
          <div>
            <div
              style={{
                "font-size": "11px",
                "font-weight": "600",
                color: "var(--oc-text-tertiary)",
                "text-transform": "uppercase",
                "letter-spacing": "0.05em",
                "margin-bottom": "6px",
              }}
            >
              Recent Directories
            </div>
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: "2px",
                "max-height": "200px",
                overflow: "auto",
              }}
            >
              <For each={recent()}>
                {(dir) => (
                  <button
                    onClick={() => handleSelectRecent(dir)}
                    style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "8px",
                      width: "100%",
                      padding: "6px 10px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--oc-text-secondary)",
                      "font-size": "12px",
                      "font-family": "var(--oc-font-mono)",
                      "text-align": "left",
                      "border-radius": "var(--oc-radius-sm)",
                      transition: "background 100ms ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent"
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ "flex-shrink": "0" }}>
                      <path d="M1 3.5h2l1.5-1.5h5.5v8h-9z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span style={{ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                      {dir}
                    </span>
                  </button>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </Dialog>
  )
}
