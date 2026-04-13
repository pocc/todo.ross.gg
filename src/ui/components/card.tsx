import { type JSX, type Component, splitProps } from "solid-js"

export interface CardProps {
  children?: JSX.Element
  class?: string
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>
  hover?: boolean
}

export const Card: Component<CardProps> = (props) => {
  const [local] = splitProps(props, ["children", "class", "onClick", "hover"])

  return (
    <div
      class={local.class}
      onClick={local.onClick}
      style={{
        background: "var(--oc-surface-primary)",
        border: "1px solid var(--oc-border-primary)",
        "border-radius": "var(--oc-radius-lg)",
        padding: "16px",
        transition: "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
        cursor: local.onClick ? "pointer" : "default",
      }}
      onMouseEnter={(e: MouseEvent) => {
        if (local.hover || local.onClick) {
          const el = e.currentTarget as HTMLElement
          el.style.background = "var(--oc-bg-hover)"
          el.style.borderColor = "var(--oc-border-focus)"
          el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"
        }
      }}
      onMouseLeave={(e: MouseEvent) => {
        if (local.hover || local.onClick) {
          const el = e.currentTarget as HTMLElement
          el.style.background = "var(--oc-surface-primary)"
          el.style.borderColor = "var(--oc-border-primary)"
          el.style.boxShadow = "none"
        }
      }}
    >
      {local.children}
    </div>
  )
}
