import { type Component, For, createSignal, Show, onCleanup } from "solid-js"
import { useSettings } from "~/context/settings"
import { Button } from "~/ui/components/button"

const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

function formatShortcut(shortcut: string): string {
  return shortcut
    .split("+")
    .map((part) => {
      switch (part.toLowerCase()) {
        case "mod":
          return IS_MAC ? "Cmd" : "Ctrl"
        case "ctrl":
          return "Ctrl"
        case "shift":
          return "Shift"
        case "alt":
          return IS_MAC ? "Opt" : "Alt"
        case "meta":
        case "cmd":
          return "Cmd"
        case "enter":
          return "Enter"
        case "escape":
          return "Esc"
        case "`":
          return "`"
        default:
          return part.toUpperCase()
      }
    })
    .join(" + ")
}

function keybindLabel(key: string): string {
  return key
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" > ")
}

function captureKeyCombo(event: KeyboardEvent): string | null {
  if (["Shift", "Control", "Alt", "Meta"].includes(event.key)) {
    return null
  }

  const parts: string[] = []
  if (event.ctrlKey && !IS_MAC) parts.push("mod")
  if (event.metaKey && IS_MAC) parts.push("mod")
  if (event.ctrlKey && IS_MAC) parts.push("ctrl")
  if (event.shiftKey) parts.push("shift")
  if (event.altKey) parts.push("alt")

  let key = event.key.toLowerCase()
  if (key === " ") key = "space"
  parts.push(key)

  return parts.join("+")
}

export const SettingsKeybinds: Component = () => {
  const { settings, updateSettings, resetSettings } = useSettings()
  const [editingKey, setEditingKey] = createSignal<string | null>(null)
  const [pendingCombo, setPendingCombo] = createSignal<string | null>(null)

  function keybindEntries() {
    return Object.entries(settings.keybinds)
  }

  function startEditing(key: string) {
    setEditingKey(key)
    setPendingCombo(null)

    function handler(event: KeyboardEvent) {
      event.preventDefault()
      event.stopPropagation()

      const combo = captureKeyCombo(event)
      if (combo) {
        updateSettings(`keybinds.${key}`, combo)
        setEditingKey(null)
        setPendingCombo(null)
        document.removeEventListener("keydown", handler, true)
      }
    }

    document.addEventListener("keydown", handler, true)

    // Auto-cancel after 5 seconds
    const timeout = setTimeout(() => {
      setEditingKey(null)
      setPendingCombo(null)
      document.removeEventListener("keydown", handler, true)
    }, 5000)

    onCleanup(() => {
      clearTimeout(timeout)
      document.removeEventListener("keydown", handler, true)
    })
  }

  function resetKeybind(key: string) {
    const defaults: Record<string, string> = {
      "command.palette": "mod+k",
      "session.new": "mod+n",
      "session.close": "mod+w",
      "sidebar.toggle": "mod+b",
      "terminal.toggle": "mod+`",
      "message.send": "Enter",
      "message.newline": "shift+Enter",
      "message.abort": "Escape",
      "file.tree.toggle": "mod+shift+e",
      "review.panel.toggle": "mod+shift+d",
      "settings.open": "mod+,",
      "search.focus": "mod+f",
    }
    if (defaults[key]) {
      updateSettings(`keybinds.${key}`, defaults[key])
    }
  }

  function handleResetAll() {
    resetSettings()
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          "align-items": "center",
          "justify-content": "space-between",
          "margin-bottom": "16px",
        }}
      >
        <div
          style={{
            "font-size": "13px",
            "font-weight": "600",
            color: "var(--oc-text-primary)",
          }}
        >
          Keyboard Shortcuts
        </div>
        <Button variant="ghost" size="sm" onClick={handleResetAll}>
          Reset All
        </Button>
      </div>

      {/* Keybinds table */}
      <div
        style={{
          border: "1px solid var(--oc-border-primary)",
          "border-radius": "var(--oc-radius-md)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            "grid-template-columns": "1fr 160px 60px",
            padding: "8px 12px",
            background: "var(--oc-surface-secondary)",
            "border-bottom": "1px solid var(--oc-border-primary)",
            "font-size": "11px",
            "font-weight": "600",
            color: "var(--oc-text-tertiary)",
            "text-transform": "uppercase",
            "letter-spacing": "0.05em",
          }}
        >
          <span>Action</span>
          <span>Shortcut</span>
          <span />
        </div>

        {/* Rows */}
        <For each={keybindEntries()}>
          {([key, shortcut]) => {
            const isEditing = () => editingKey() === key
            return (
              <div
                style={{
                  display: "grid",
                  "grid-template-columns": "1fr 160px 60px",
                  "align-items": "center",
                  padding: "8px 12px",
                  "border-bottom": "1px solid var(--oc-border-secondary)",
                  background: isEditing() ? "var(--oc-bg-hover)" : "transparent",
                }}
              >
                <span
                  style={{
                    "font-size": "13px",
                    color: "var(--oc-text-secondary)",
                  }}
                >
                  {keybindLabel(key)}
                </span>
                <div>
                  <Show
                    when={isEditing()}
                    fallback={
                      <button
                        onClick={() => startEditing(key)}
                        style={{
                          display: "inline-flex",
                          "align-items": "center",
                          gap: "4px",
                          padding: "3px 8px",
                          "font-size": "12px",
                          "font-family": "var(--oc-font-mono)",
                          color: "var(--oc-text-primary)",
                          background: "var(--oc-surface-secondary)",
                          border: "1px solid var(--oc-border-primary)",
                          "border-radius": "var(--oc-radius-sm)",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--oc-border-focus)"
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--oc-border-primary)"
                        }}
                      >
                        {formatShortcut(shortcut as string)}
                      </button>
                    }
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        "align-items": "center",
                        padding: "3px 8px",
                        "font-size": "12px",
                        "font-family": "var(--oc-font-mono)",
                        color: "var(--oc-warning)",
                        background: "var(--oc-surface-primary)",
                        border: "1px solid var(--oc-warning)",
                        "border-radius": "var(--oc-radius-sm)",
                        animation: "oc-pulse-border 1s ease-in-out infinite",
                      }}
                    >
                      Press keys...
                    </span>
                  </Show>
                </div>
                <div style={{ display: "flex", "justify-content": "flex-end" }}>
                  <button
                    onClick={() => resetKeybind(key)}
                    title="Reset to default"
                    style={{
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "center",
                      width: "24px",
                      height: "24px",
                      background: "transparent",
                      border: "none",
                      "border-radius": "var(--oc-radius-sm)",
                      color: "var(--oc-text-tertiary)",
                      cursor: "pointer",
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
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l2 2m0 0L2 6m2-2h5a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          }}
        </For>
      </div>

      <style>{`
        @keyframes oc-pulse-border {
          0%, 100% { border-color: var(--oc-warning); }
          50% { border-color: transparent; }
        }
      `}</style>
    </div>
  )
}
