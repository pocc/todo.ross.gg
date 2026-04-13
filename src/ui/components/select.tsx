import { Select as KobalteSelect } from "@kobalte/core/select"
import { type Component, splitProps, Show, For } from "solid-js"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  class?: string
}

export const Select: Component<SelectProps> = (props) => {
  const [local] = splitProps(props, [
    "options",
    "value",
    "onChange",
    "placeholder",
    "label",
    "disabled",
    "class",
  ])

  return (
    <KobalteSelect<SelectOption>
      options={local.options}
      optionValue="value"
      optionTextValue="label"
      value={local.options.find((o) => o.value === local.value)}
      onChange={(opt) => {
        if (opt) local.onChange?.(opt.value)
      }}
      disabled={local.disabled}
      placeholder={local.placeholder}
      itemComponent={(itemProps) => (
        <KobalteSelect.Item
          item={itemProps.item}
          style={{
            padding: "6px 10px",
            "font-size": "13px",
            cursor: "pointer",
            "border-radius": "var(--oc-radius-sm)",
            color: "var(--oc-text-primary)",
            outline: "none",
          }}
          onMouseEnter={(e: MouseEvent) => {
            (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
          }}
          onMouseLeave={(e: MouseEvent) => {
            (e.currentTarget as HTMLElement).style.background = "transparent"
          }}
        >
          <KobalteSelect.ItemLabel>{itemProps.item.rawValue.label}</KobalteSelect.ItemLabel>
        </KobalteSelect.Item>
      )}
    >
      <Show when={local.label}>
        <KobalteSelect.Label
          style={{
            "font-size": "12px",
            "font-weight": "500",
            color: "var(--oc-text-secondary)",
            "margin-bottom": "4px",
            display: "block",
          }}
        >
          {local.label}
        </KobalteSelect.Label>
      </Show>
      <KobalteSelect.Trigger
        class={local.class}
        style={{
          display: "inline-flex",
          "align-items": "center",
          "justify-content": "space-between",
          width: "100%",
          padding: "6px 10px",
          background: "var(--oc-surface-primary)",
          color: "var(--oc-text-primary)",
          border: "1px solid var(--oc-border-primary)",
          "border-radius": "var(--oc-radius-md)",
          "font-size": "13px",
          "font-family": "var(--oc-font-sans)",
          cursor: local.disabled ? "not-allowed" : "pointer",
          opacity: local.disabled ? "0.5" : "1",
          outline: "none",
          gap: "8px",
        }}
      >
        <KobalteSelect.Value<SelectOption>>
          {(state) => state.selectedOption()?.label ?? local.placeholder ?? "Select..."}
        </KobalteSelect.Value>
        <KobalteSelect.Icon>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </KobalteSelect.Icon>
      </KobalteSelect.Trigger>
      <KobalteSelect.Portal>
        <KobalteSelect.Content
          style={{
            background: "var(--oc-bg-elevated)",
            border: "1px solid var(--oc-border-primary)",
            "border-radius": "var(--oc-radius-md)",
            "box-shadow": "0 8px 24px rgba(0,0,0,0.3)",
            padding: "4px",
            "z-index": "1000",
            "max-height": "240px",
            overflow: "auto",
          }}
        >
          <KobalteSelect.Listbox />
        </KobalteSelect.Content>
      </KobalteSelect.Portal>
    </KobalteSelect>
  )
}
