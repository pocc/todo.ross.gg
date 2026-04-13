import { DropdownMenu as KobalteDropdownMenu } from "@kobalte/core/dropdown-menu"
import { type JSX, type Component, splitProps, For } from "solid-js"

export interface DropdownMenuItem {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}

export interface DropdownMenuProps {
  trigger: JSX.Element
  items: DropdownMenuItem[]
  class?: string
}

export const DropdownMenu: Component<DropdownMenuProps> = (props) => {
  const [local] = splitProps(props, ["trigger", "items", "class"])

  return (
    <KobalteDropdownMenu>
      <KobalteDropdownMenu.Trigger as="div" class={local.class} style={{ display: "inline-flex" }}>
        {local.trigger}
      </KobalteDropdownMenu.Trigger>
      <KobalteDropdownMenu.Portal>
        <KobalteDropdownMenu.Content
          style={{
            background: "var(--oc-bg-elevated)",
            border: "1px solid var(--oc-border-primary)",
            "border-radius": "var(--oc-radius-md)",
            padding: "4px",
            "min-width": "160px",
            "box-shadow": "0 8px 24px rgba(0, 0, 0, 0.3)",
            "z-index": "1000",
            animation: "oc-menu-in 100ms ease",
            outline: "none",
          }}
        >
          <style>{`@keyframes oc-menu-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <For each={local.items}>
            {(item) => (
              <KobalteDropdownMenu.Item
                onSelect={item.onClick}
                disabled={item.disabled}
                style={{
                  padding: "6px 10px",
                  "font-size": "13px",
                  "font-family": "var(--oc-font-sans)",
                  "border-radius": "var(--oc-radius-sm)",
                  color: item.danger ? "var(--oc-error)" : "var(--oc-text-primary)",
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  opacity: item.disabled ? "0.5" : "1",
                  display: "flex",
                  "align-items": "center",
                  outline: "none",
                }}
                onMouseEnter={(e: MouseEvent) => {
                  if (!item.disabled) {
                    (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
                  }
                }}
                onMouseLeave={(e: MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent"
                }}
              >
                {item.label}
              </KobalteDropdownMenu.Item>
            )}
          </For>
        </KobalteDropdownMenu.Content>
      </KobalteDropdownMenu.Portal>
    </KobalteDropdownMenu>
  )
}
