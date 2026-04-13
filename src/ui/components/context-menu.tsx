import { ContextMenu as KobalteContextMenu } from "@kobalte/core/context-menu"
import { type JSX, type Component, splitProps, For } from "solid-js"

export interface ContextMenuItem {
  label: string
  onClick: () => void
}

export interface ContextMenuProps {
  items: ContextMenuItem[]
  children: JSX.Element
  class?: string
}

export const ContextMenu: Component<ContextMenuProps> = (props) => {
  const [local] = splitProps(props, ["items", "children", "class"])

  return (
    <KobalteContextMenu>
      <KobalteContextMenu.Trigger class={local.class} style={{ display: "contents" }}>
        {local.children}
      </KobalteContextMenu.Trigger>
      <KobalteContextMenu.Portal>
        <KobalteContextMenu.Content
          style={{
            background: "var(--oc-bg-elevated)",
            border: "1px solid var(--oc-border-primary)",
            "border-radius": "var(--oc-radius-md)",
            padding: "4px",
            "min-width": "160px",
            "box-shadow": "0 8px 24px rgba(0, 0, 0, 0.3)",
            "z-index": "1000",
            animation: "oc-ctx-in 100ms ease",
            outline: "none",
          }}
        >
          <style>{`@keyframes oc-ctx-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
          <For each={local.items}>
            {(item) => (
              <KobalteContextMenu.Item
                onSelect={item.onClick}
                style={{
                  padding: "6px 10px",
                  "font-size": "13px",
                  "font-family": "var(--oc-font-sans)",
                  "border-radius": "var(--oc-radius-sm)",
                  color: "var(--oc-text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  "align-items": "center",
                  outline: "none",
                }}
                onMouseEnter={(e: MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
                }}
                onMouseLeave={(e: MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent"
                }}
              >
                {item.label}
              </KobalteContextMenu.Item>
            )}
          </For>
        </KobalteContextMenu.Content>
      </KobalteContextMenu.Portal>
    </KobalteContextMenu>
  )
}
