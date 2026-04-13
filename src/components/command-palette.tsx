import { type Component, createSignal, createMemo, For, Show, onMount, onCleanup, createEffect } from "solid-js"
import { useCommand } from "~/context/command"
import type { CommandItem } from "~/lib/types"

const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

function formatShortcut(shortcut: string): string {
  return shortcut
    .split("+")
    .map((part) => {
      switch (part.toLowerCase()) {
        case "mod": return IS_MAC ? "\u2318" : "Ctrl"
        case "ctrl": return IS_MAC ? "\u2303" : "Ctrl"
        case "shift": return "\u21E7"
        case "alt": return IS_MAC ? "\u2325" : "Alt"
        case "meta": case "cmd": return "\u2318"
        case "enter": return "\u23CE"
        case "escape": return "Esc"
        case "backspace": return "\u232B"
        case "`": return "`"
        default: return part.toUpperCase()
      }
    })
    .join("")
}

export const CommandPalette: Component = () => {
  const cmd = useCommand()

  const [query, setQuery] = createSignal("")
  const [selectedIndex, setSelectedIndex] = createSignal(0)

  let inputRef: HTMLInputElement | undefined

  const filtered = createMemo(() => cmd.search(query()))

  const grouped = createMemo(() => {
    const items = filtered()
    const groups = new Map<string, CommandItem[]>()

    for (const item of items) {
      const group = item.group ?? "Commands"
      if (!groups.has(group)) {
        groups.set(group, [])
      }
      groups.get(group)!.push(item)
    }

    return Array.from(groups.entries())
  })

  const flatItems = createMemo(() => {
    const result: CommandItem[] = []
    for (const [, items] of grouped()) {
      result.push(...items)
    }
    return result
  })

  // Reset selection when query changes
  createEffect(() => {
    query()
    setSelectedIndex(0)
  })

  // Focus input when opened
  createEffect(() => {
    if (cmd.open()) {
      setQuery("")
      setSelectedIndex(0)
      requestAnimationFrame(() => {
        inputRef?.focus()
      })
    }
  })

  function handleKeyDown(event: KeyboardEvent) {
    const items = flatItems()

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setSelectedIndex((i) => (i + 1) % Math.max(items.length, 1))
        break
      case "ArrowUp":
        event.preventDefault()
        setSelectedIndex((i) => (i - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1))
        break
      case "Enter":
        event.preventDefault()
        if (items[selectedIndex()]) {
          items[selectedIndex()].action()
          cmd.closePalette()
        }
        break
      case "Escape":
        event.preventDefault()
        cmd.closePalette()
        break
    }
  }

  function handleItemClick(item: CommandItem) {
    item.action()
    cmd.closePalette()
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      cmd.closePalette()
    }
  }

  return (
    <Show when={cmd.open()}>
      {/* Backdrop */}
      <div
        onClick={handleOverlayClick}
        style={{
          position: "fixed",
          inset: "0",
          background: "rgba(0, 0, 0, 0.5)",
          "z-index": "2000",
          "backdrop-filter": "blur(2px)",
          animation: "oc-fade-in 100ms ease",
        }}
      >
        {/* Palette container */}
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90vw",
            "max-width": "520px",
            background: "var(--oc-bg-elevated)",
            border: "1px solid var(--oc-border-primary)",
            "border-radius": "var(--oc-radius-xl)",
            "box-shadow": "0 24px 64px rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
            animation: "oc-palette-in 150ms ease",
          }}
        >
          <style>{`
            @keyframes oc-palette-in {
              from { opacity: 0; transform: translateX(-50%) scale(0.96); }
              to { opacity: 1; transform: translateX(-50%) scale(1); }
            }
          `}</style>

          {/* Search input */}
          <div
            style={{
              display: "flex",
              "align-items": "center",
              gap: "8px",
              padding: "12px 16px",
              "border-bottom": "1px solid var(--oc-border-primary)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ "flex-shrink": "0", color: "var(--oc-text-tertiary)" }}>
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query()}
              onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              style={{
                flex: "1",
                padding: "0",
                "font-size": "14px",
                "font-family": "var(--oc-font-sans)",
                color: "var(--oc-text-primary)",
                background: "transparent",
                border: "none",
                outline: "none",
              }}
            />
            <kbd
              style={{
                padding: "2px 6px",
                "font-size": "11px",
                "font-family": "var(--oc-font-mono)",
                color: "var(--oc-text-tertiary)",
                background: "var(--oc-surface-secondary)",
                "border-radius": "var(--oc-radius-sm)",
                border: "1px solid var(--oc-border-primary)",
              }}
            >
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div
            style={{
              "max-height": "360px",
              overflow: "auto",
              padding: "4px",
            }}
          >
            <Show
              when={flatItems().length > 0}
              fallback={
                <div
                  style={{
                    padding: "24px",
                    "text-align": "center",
                    "font-size": "13px",
                    color: "var(--oc-text-tertiary)",
                  }}
                >
                  No commands found
                </div>
              }
            >
              {(() => {
                let flatIndex = 0
                return (
                  <For each={grouped()}>
                    {([groupName, items]) => (
                      <div>
                        <div
                          style={{
                            padding: "6px 12px 4px",
                            "font-size": "11px",
                            "font-weight": "600",
                            color: "var(--oc-text-tertiary)",
                            "text-transform": "uppercase",
                            "letter-spacing": "0.05em",
                          }}
                        >
                          {groupName}
                        </div>
                        <For each={items}>
                          {(item) => {
                            const idx = flatIndex++
                            const isSelected = () => selectedIndex() === idx
                            return (
                              <button
                                onClick={() => handleItemClick(item)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                style={{
                                  display: "flex",
                                  "align-items": "center",
                                  "justify-content": "space-between",
                                  width: "100%",
                                  padding: "8px 12px",
                                  background: isSelected() ? "var(--oc-bg-hover)" : "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "var(--oc-text-primary)",
                                  "font-size": "13px",
                                  "font-family": "var(--oc-font-sans)",
                                  "text-align": "left",
                                  "border-radius": "var(--oc-radius-md)",
                                  transition: "background 50ms ease",
                                  outline: "none",
                                }}
                              >
                                <span>{item.label}</span>
                                <Show when={item.shortcut}>
                                  <kbd
                                    style={{
                                      padding: "2px 6px",
                                      "font-size": "11px",
                                      "font-family": "var(--oc-font-mono)",
                                      color: "var(--oc-text-tertiary)",
                                      background: "var(--oc-surface-secondary)",
                                      "border-radius": "var(--oc-radius-sm)",
                                      border: "1px solid var(--oc-border-primary)",
                                    }}
                                  >
                                    {formatShortcut(item.shortcut!)}
                                  </kbd>
                                </Show>
                              </button>
                            )
                          }}
                        </For>
                      </div>
                    )}
                  </For>
                )
              })()}
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}
