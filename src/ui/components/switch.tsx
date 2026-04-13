import { Switch as KobalteSwitch } from "@kobalte/core/switch"
import { type Component, splitProps, Show } from "solid-js"

export interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  class?: string
}

export const Switch: Component<SwitchProps> = (props) => {
  const [local] = splitProps(props, ["checked", "onChange", "label", "disabled", "class"])

  return (
    <KobalteSwitch
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
      <KobalteSwitch.Input />
      <KobalteSwitch.Control
        style={{
          width: "36px",
          height: "20px",
          "border-radius": "10px",
          background: local.checked ? "var(--oc-accent-primary)" : "var(--oc-surface-tertiary)",
          border: "1px solid var(--oc-border-primary)",
          position: "relative",
          transition: "background 150ms ease",
          "flex-shrink": "0",
          padding: "0",
        }}
      >
        <KobalteSwitch.Thumb
          style={{
            width: "14px",
            height: "14px",
            "border-radius": "50%",
            background: "white",
            position: "absolute",
            top: "2px",
            left: local.checked ? "19px" : "2px",
            transition: "left 150ms ease",
            "box-shadow": "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </KobalteSwitch.Control>
      <Show when={local.label}>
        <KobalteSwitch.Label
          style={{
            "font-size": "13px",
            color: "var(--oc-text-primary)",
            "user-select": "none",
          }}
        >
          {local.label}
        </KobalteSwitch.Label>
      </Show>
    </KobalteSwitch>
  )
}
