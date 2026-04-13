import { type JSX, type Component, splitProps } from "solid-js"

export interface TagProps {
  children?: JSX.Element
  variant?: "default" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md"
  class?: string
}

const variantMap: Record<string, { bg: string; color: string; border: string }> = {
  default: { bg: "var(--oc-surface-secondary)", color: "var(--oc-text-secondary)", border: "var(--oc-border-primary)" },
  success: { bg: "rgba(52, 211, 153, 0.1)", color: "var(--oc-success)", border: "rgba(52, 211, 153, 0.3)" },
  warning: { bg: "rgba(251, 191, 36, 0.1)", color: "var(--oc-warning)", border: "rgba(251, 191, 36, 0.3)" },
  error: { bg: "rgba(248, 113, 113, 0.1)", color: "var(--oc-error)", border: "rgba(248, 113, 113, 0.3)" },
  info: { bg: "rgba(96, 165, 250, 0.1)", color: "var(--oc-info)", border: "rgba(96, 165, 250, 0.3)" },
}

export const Tag: Component<TagProps> = (props) => {
  const [local] = splitProps(props, ["children", "variant", "size", "class"])
  const v = () => variantMap[local.variant ?? "default"]
  const isSmall = () => (local.size ?? "sm") === "sm"

  return (
    <span
      class={local.class}
      style={{
        display: "inline-flex",
        "align-items": "center",
        padding: isSmall() ? "1px 6px" : "2px 8px",
        "font-size": isSmall() ? "11px" : "12px",
        "font-weight": "500",
        "font-family": "var(--oc-font-sans)",
        "border-radius": "var(--oc-radius-sm)",
        background: v().bg,
        color: v().color,
        border: `1px solid ${v().border}`,
        "white-space": "nowrap",
        "line-height": "1.5",
      }}
    >
      {local.children}
    </span>
  )
}
