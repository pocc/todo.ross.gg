import { type Component, splitProps } from "solid-js"

export interface ToolCountLabelProps {
  count: number
  label: string
}

export const ToolCountLabel: Component<ToolCountLabelProps> = (props) => {
  const [local] = splitProps(props, ["count", "label"])

  return (
    <span
      style={{
        display: "inline-flex",
        "align-items": "center",
        gap: "4px",
        padding: "2px 8px",
        "font-size": "11px",
        "font-weight": "500",
        "font-family": "var(--oc-font-sans)",
        "border-radius": "var(--oc-radius-sm)",
        background: "var(--oc-surface-secondary)",
        color: "var(--oc-text-secondary)",
        border: "1px solid var(--oc-border-primary)",
      }}
    >
      <span style={{ "font-weight": "600", color: "var(--oc-text-primary)" }}>{local.count}</span>
      {local.label}
    </span>
  )
}
