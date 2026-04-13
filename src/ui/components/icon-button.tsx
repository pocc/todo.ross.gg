import { Button as KobalteButton } from "@kobalte/core/button"
import { type JSX, type Component, splitProps } from "solid-js"

export interface IconButtonProps {
  size?: "sm" | "md" | "lg"
  label: string
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>
  children?: JSX.Element
  variant?: "primary" | "secondary" | "ghost" | "danger"
  disabled?: boolean
  class?: string
}

const sizePx = { sm: 28, md: 32, lg: 40 }

const variantBg: { [key: string]: string } = {
  primary: "var(--oc-accent-primary)",
  secondary: "var(--oc-surface-secondary)",
  ghost: "transparent",
  danger: "var(--oc-error)",
}

const variantColor: { [key: string]: string } = {
  primary: "var(--oc-accent-text)",
  secondary: "var(--oc-text-primary)",
  ghost: "var(--oc-text-secondary)",
  danger: "#ffffff",
}

export const IconButton: Component<IconButtonProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "size",
    "label",
    "onClick",
    "children",
    "variant",
    "disabled",
    "class",
  ])

  const v = () => local.variant ?? "ghost"
  const s = () => sizePx[local.size ?? "md"]

  return (
    <KobalteButton
      class={local.class}
      aria-label={local.label}
      disabled={local.disabled}
      onClick={local.onClick}
      style={{
        display: "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        width: `${s()}px`,
        height: `${s()}px`,
        "border-radius": "var(--oc-radius-md)",
        background: variantBg[v()],
        color: variantColor[v()],
        border: v() === "secondary" ? "1px solid var(--oc-border-primary)" : "1px solid transparent",
        cursor: local.disabled ? "not-allowed" : "pointer",
        opacity: local.disabled ? "0.5" : "1",
        transition: "background 150ms ease",
        padding: "0",
        "flex-shrink": "0",
        outline: "none",
      }}
      onMouseEnter={(e: MouseEvent) => {
        if (!local.disabled) {
          (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
        }
      }}
      onMouseLeave={(e: MouseEvent) => {
        (e.currentTarget as HTMLElement).style.background = variantBg[v()]
      }}
      onFocus={(e: FocusEvent) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px var(--oc-border-focus)"
      }}
      onBlur={(e: FocusEvent) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none"
      }}
    >
      {local.children}
    </KobalteButton>
  )
}
