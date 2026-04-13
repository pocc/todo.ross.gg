import { Button as KobalteButton } from "@kobalte/core/button"
import { type JSX, type Component, splitProps, Show } from "solid-js"
import { Spinner } from "./spinner"

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>
  children?: JSX.Element
  class?: string
  type?: "button" | "submit" | "reset"
}

const variantStyles: Record<string, JSX.CSSProperties & Record<string, string>> = {
  primary: {
    background: "var(--oc-accent-primary)",
    color: "var(--oc-accent-text)",
    border: "1px solid transparent",
  },
  secondary: {
    background: "var(--oc-surface-secondary)",
    color: "var(--oc-text-primary)",
    border: "1px solid var(--oc-border-primary)",
  },
  ghost: {
    background: "transparent",
    color: "var(--oc-text-primary)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--oc-error)",
    color: "#ffffff",
    border: "1px solid transparent",
  },
}

const sizeStyles: Record<string, JSX.CSSProperties & Record<string, string>> = {
  sm: { padding: "4px 10px", "font-size": "12px", "border-radius": "var(--oc-radius-sm)" },
  md: { padding: "6px 14px", "font-size": "13px", "border-radius": "var(--oc-radius-md)" },
  lg: { padding: "8px 20px", "font-size": "14px", "border-radius": "var(--oc-radius-lg)" },
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "variant",
    "size",
    "disabled",
    "loading",
    "onClick",
    "children",
    "class",
    "type",
  ])

  const variant = () => local.variant ?? "primary"
  const size = () => local.size ?? "md"

  return (
    <KobalteButton
      class={local.class}
      style={{
        ...variantStyles[variant()],
        ...sizeStyles[size()],
        display: "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        gap: "6px",
        "font-family": "var(--oc-font-sans)",
        "font-weight": "500",
        cursor: local.disabled || local.loading ? "not-allowed" : "pointer",
        opacity: local.disabled ? "0.5" : "1",
        transition: "background 150ms ease, opacity 150ms ease",
        "white-space": "nowrap",
        "line-height": "1.4",
        outline: "none",
      }}
      disabled={local.disabled || local.loading}
      onClick={local.loading ? undefined : local.onClick}
      onMouseEnter={(e: MouseEvent) => {
        const target = e.currentTarget as HTMLButtonElement
        if (!local.disabled && !local.loading) {
          if (variant() === "primary") target.style.background = "var(--oc-accent-hover)"
          else if (variant() === "ghost") target.style.background = "var(--oc-bg-hover)"
          else if (variant() === "secondary") target.style.background = "var(--oc-bg-hover)"
        }
      }}
      onMouseLeave={(e: MouseEvent) => {
        const target = e.currentTarget as HTMLButtonElement
        target.style.background = variantStyles[variant()].background as string
      }}
      onFocus={(e: FocusEvent) => {
        const target = e.currentTarget as HTMLButtonElement
        target.style.boxShadow = "0 0 0 2px var(--oc-border-focus)"
      }}
      onBlur={(e: FocusEvent) => {
        const target = e.currentTarget as HTMLButtonElement
        target.style.boxShadow = "none"
      }}
    >
      <Show when={local.loading}>
        <Spinner size="sm" />
      </Show>
      {local.children}
    </KobalteButton>
  )
}
