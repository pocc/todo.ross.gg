import { type Component, For, Show, createSignal } from "solid-js"
import { useModels } from "~/context/models"
import { Button } from "~/ui/components/button"

export const SettingsModels: Component = () => {
  const models = useModels()
  const [expandedProvider, setExpandedProvider] = createSignal<string | null>(null)

  const providerEntries = () => Object.entries(models.providers)

  function toggleProvider(id: string) {
    setExpandedProvider((prev) => (prev === id ? null : id))
  }

  function handleSelectDefault(provider: string, model: string) {
    models.selectModel(provider, model)
  }

  return (
    <div>
      <div
        style={{
          "font-size": "13px",
          "font-weight": "600",
          color: "var(--oc-text-primary)",
          "margin-bottom": "16px",
        }}
      >
        Available Models
      </div>

      <Show
        when={providerEntries().length > 0}
        fallback={
          <div
            style={{
              "font-size": "13px",
              color: "var(--oc-text-tertiary)",
              padding: "24px 0",
              "text-align": "center",
            }}
          >
            No providers configured. Connect a provider first.
          </div>
        }
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
          <For each={providerEntries()}>
            {([id, provider]) => {
              const isExpanded = () => expandedProvider() === id
              return (
                <div
                  style={{
                    border: "1px solid var(--oc-border-primary)",
                    "border-radius": "var(--oc-radius-md)",
                    overflow: "hidden",
                  }}
                >
                  {/* Provider header */}
                  <button
                    onClick={() => toggleProvider(id)}
                    style={{
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "space-between",
                      width: "100%",
                      padding: "10px 12px",
                      background: "var(--oc-surface-secondary)",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--oc-text-primary)",
                      "font-size": "13px",
                      "font-family": "var(--oc-font-sans)",
                      "font-weight": "500",
                      "text-align": "left",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--oc-surface-secondary)"
                    }}
                  >
                    <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{
                          transform: isExpanded() ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 150ms ease",
                        }}
                      >
                        <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <span>{provider.name}</span>
                    </div>
                    <span
                      style={{
                        "font-size": "11px",
                        color: "var(--oc-text-tertiary)",
                        "font-weight": "400",
                      }}
                    >
                      {provider.models?.length ?? 0} models
                    </span>
                  </button>

                  {/* Models list */}
                  <Show when={isExpanded()}>
                    <div style={{ "border-top": "1px solid var(--oc-border-primary)" }}>
                      <For each={provider.models ?? []}>
                        {(model) => {
                          const isSelected = () =>
                            models.selectedProvider() === id && models.selectedModel() === model.id
                          return (
                            <div
                              style={{
                                display: "flex",
                                "align-items": "center",
                                "justify-content": "space-between",
                                padding: "8px 12px 8px 32px",
                                "font-size": "12px",
                                color: "var(--oc-text-secondary)",
                                "border-bottom": "1px solid var(--oc-border-secondary)",
                              }}
                            >
                              <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
                                <span
                                  style={{
                                    "font-family": "var(--oc-font-mono)",
                                    "font-size": "12px",
                                  }}
                                >
                                  {model.name}
                                </span>
                                <Show when={isSelected()}>
                                  <span
                                    style={{
                                      "font-size": "10px",
                                      padding: "1px 6px",
                                      background: "var(--oc-accent-primary)",
                                      color: "var(--oc-accent-text)",
                                      "border-radius": "var(--oc-radius-sm)",
                                      "font-weight": "500",
                                    }}
                                  >
                                    Default
                                  </span>
                                </Show>
                              </div>
                              <Show when={!isSelected()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSelectDefault(id, model.id)}
                                >
                                  Set Default
                                </Button>
                              </Show>
                            </div>
                          )
                        }}
                      </For>
                    </div>
                  </Show>
                </div>
              )
            }}
          </For>
        </div>
      </Show>

      <div style={{ "margin-top": "16px" }}>
        <Button variant="secondary" size="sm" disabled>
          Add Custom Model
        </Button>
      </div>
    </div>
  )
}
