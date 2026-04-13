import { Checkbox as KobalteCheckbox } from "@kobalte/core/checkbox"
import { type Component, splitProps, Show } from "solid-js"

export interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  class?: string
}

export const Checkbox: Component<CheckboxProps> = (props) => {
  const [local] = splitProps(props, ["checked", "onChange", "label", "disabled", "class"])

  return (
    <KobalteCheckbox
      class={local.class}
      checked={local.checked}
      onChange={local.onChange}
      disabled={local.disabled}
      style={{
        display: "inline-flex",
        "align-items": "center",
        gap: "8px",
        cursor: local.disabled ? "not-allowed" : "pointer",
        opacity: local.disabled ? "0.5" : "1",
      }}
    >
      <KobalteCheckbox.Input />
      <KobalteCheckbox.Control
        style={{
          width: "16px",
          height: "16px",
          "border-radius": "var(--oc-radius-sm)",
          border: "1px solid var(--oc-border-primary)",
          background: local.checked ? "var(--oc-accent-primary)" : "var(--oc-surface-primary)",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          transition: "background 150ms ease, border-color 150ms ease",
          "flex-shrink": "0",
        }}
      >
        <KobalteCheckbox.Indicator>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </KobalteCheckbox.Indicator>
      </KobalteCheckbox.Control>
      <Show when={local.label}>
        <KobalteCheckbox.Label
          style={{
            "font-size": "13px",
            color: "var(--oc-text-primary)",
            "user-select": "none",
          }}
        >
          {local.label}
        </KobalteCheckbox.Label>
      </Show>
    </KobalteCheckbox>
  )
}
