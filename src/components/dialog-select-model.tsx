import { type Component, createSignal, For, Show, createMemo } from "solid-js"
import { Dialog } from "~/ui/components/dialog"
import { useModels } from "~/context/models"

export interface SelectModelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (provider: string, model: string) => void
}

export const SelectModelDialog: Component<SelectModelDialogProps> = (props) => {
  const models = useModels()
  const [search, setSearch] = createSignal("")
  const [expandedProviders, setExpandedProviders] = createSignal<Set<string>>(new Set())

  const providerEntries = () => Object.entries(models.providers)

  const filteredProviders = createMemo(() => {
    const query = search().toLowerCase().trim()
    if (!query) return providerEntries()

    return providerEntries()
      .map(([id, provider]) => {
        const filteredModels = (provider.models ?? []).filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.id.toLowerCase().includes(query) ||
            provider.name.toLowerCase().includes(query)
        )
        return [id, { ...provider, models: filteredModels }] as const
      })
      .filter(([, provider]) => provider.models.length > 0)
  })

  function toggleProvider(id: string) {
    setExpandedProviders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function isExpanded(id: string): boolean {
    // If searching, expand all by default
    if (search().trim()) return true
    return expandedProviders().has(id)
  }

  function handleSelect(provider: string, model: string) {
    props.onSelect(provider, model)
    props.onOpenChange(false)
    setSearch("")
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) setSearch("")
        props.onOpenChange(open)
      }}
      title="Select Model"
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
        {/* Search input */}
        <input
          type="text"
          value={search()}
          onInput={(e) => setSearch((e.currentTarget as HTMLInputElement).value)}
          placeholder="Search models..."
          autofocus
          style={{
            width: "100%",
            padding: "8px 12px",
            "font-size": "13px",
            "font-family": "var(--oc-font-sans)",
            color: "var(--oc-text-primary)",
            background: "var(--oc-surface-primary)",
            border: "1px solid var(--oc-border-primary)",
            "border-radius": "var(--oc-radius-md)",
            outline: "none",
            "box-sizing": "border-box",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--oc-border-focus)"
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--oc-border-primary)"
          }}
        />

        {/* Provider / model list */}
        <div
          style={{
            "max-height": "360px",
            overflow: "auto",
            display: "flex",
            "flex-direction": "column",
            gap: "4px",
          }}
        >
          <Show
            when={filteredProviders().length > 0}
            fallback={
              <div
                style={{
                  padding: "24px",
                  "text-align": "center",
                  "font-size": "13px",
                  color: "var(--oc-text-tertiary)",
                }}
              >
                No models found
              </div>
            }
          >
            <For each={filteredProviders()}>
              {([id, provider]) => (
                <div>
                  {/* Provider header */}
                  <button
                    onClick={() => toggleProvider(id as string)}
                    style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "6px",
                      width: "100%",
                      padding: "6px 8px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--oc-text-secondary)",
                      "font-size": "12px",
                      "font-weight": "600",
                      "font-family": "var(--oc-font-sans)",
                      "text-align": "left",
                      "text-transform": "uppercase",
                      "letter-spacing": "0.04em",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      style={{
                        transform: isExpanded(id as string) ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 100ms ease",
                      }}
                    >
                      <path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    {provider.name}
                  </button>

                  {/* Models */}
                  <Show when={isExpanded(id as string)}>
                    <For each={provider.models ?? []}>
                      {(model) => (
                        <button
                          onClick={() => handleSelect(id as string, model.id)}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "8px 12px 8px 28px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--oc-text-primary)",
                            "font-size": "13px",
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
                          {model.name}
                        </button>
                      )}
                    </For>
                  </Show>
                </div>
              )}
            </For>
          </Show>
        </div>
      </div>
    </Dialog>
  )
}
