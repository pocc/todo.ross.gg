import { type Component, createSignal, Show, For } from "solid-js"
import { Dialog } from "~/ui/components/dialog"
import { SettingsGeneral } from "~/components/settings/settings-general"
import { SettingsModels } from "~/components/settings/settings-models"
import { SettingsProviders } from "~/components/settings/settings-providers"
import { SettingsKeybinds } from "~/components/settings/settings-keybinds"

export interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SettingsCategory = "general" | "models" | "providers" | "keybinds"

const categories: Array<{ id: SettingsCategory; label: string; icon: string }> = [
  { id: "general", label: "General", icon: "M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 14s-6 0-6 2v1h12v-1c0-2-6-2-6-2z" },
  { id: "models", label: "Models", icon: "M4 6h12M4 10h12M4 14h8" },
  { id: "providers", label: "Providers", icon: "M13 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7l4-4V4a2 2 0 0 0-2-2z" },
  { id: "keybinds", label: "Keybinds", icon: "M2 6h16M6 2v16M10 6v10M14 6v10" },
]

export const SettingsDialog: Component<SettingsDialogProps> = (props) => {
  const [activeCategory, setActiveCategory] = createSignal<SettingsCategory>("general")

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="Settings"
    >
      <div
        style={{
          display: "flex",
          gap: "0",
          margin: "-24px",
          "margin-top": "-8px",
          "min-height": "480px",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: "180px",
            "border-right": "1px solid var(--oc-border-primary)",
            padding: "8px",
            display: "flex",
            "flex-direction": "column",
            gap: "2px",
            "flex-shrink": "0",
            background: "var(--oc-surface-secondary)",
            "border-radius": "0 0 0 var(--oc-radius-xl)",
          }}
        >
          <For each={categories}>
            {(cat) => {
              const isActive = () => activeCategory() === cat.id
              return (
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "8px",
                    padding: "8px 12px",
                    "font-size": "13px",
                    "font-family": "var(--oc-font-sans)",
                    "font-weight": isActive() ? "500" : "400",
                    color: isActive() ? "var(--oc-text-primary)" : "var(--oc-text-secondary)",
                    background: isActive() ? "var(--oc-bg-hover)" : "transparent",
                    border: "none",
                    "border-radius": "var(--oc-radius-md)",
                    cursor: "pointer",
                    "text-align": "left",
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
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d={cat.icon} />
                  </svg>
                  {cat.label}
                </button>
              )
            }}
          </For>
        </div>

        {/* Content */}
        <div
          style={{
            flex: "1",
            padding: "20px 24px",
            overflow: "auto",
            "max-height": "480px",
          }}
        >
          <Show when={activeCategory() === "general"}>
            <SettingsGeneral />
          </Show>
          <Show when={activeCategory() === "models"}>
            <SettingsModels />
          </Show>
          <Show when={activeCategory() === "providers"}>
            <SettingsProviders />
          </Show>
          <Show when={activeCategory() === "keybinds"}>
            <SettingsKeybinds />
          </Show>
        </div>
      </div>
    </Dialog>
  )
}
