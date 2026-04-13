import { Collapsible as KobalteCollapsible } from "@kobalte/core/collapsible"
import { type JSX, type Component, splitProps } from "solid-js"

export interface CollapsibleProps {
  title: string
  children?: JSX.Element
  defaultOpen?: boolean
  class?: string
}

export const Collapsible: Component<CollapsibleProps> = (props) => {
  const [local] = splitProps(props, ["title", "children", "defaultOpen", "class"])

  return (
    <KobalteCollapsible
      class={local.class}
      defaultOpen={local.defaultOpen}
      style={{ "border-radius": "var(--oc-radius-md)" }}
    >
      <KobalteCollapsible.Trigger
        style={{
          width: "100%",
          display: "flex",
          "align-items": "center",
          gap: "6px",
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          "font-size": "13px",
          "font-weight": "500",
          "font-family": "var(--oc-font-sans)",
          color: "var(--oc-text-primary)",
          cursor: "pointer",
          "border-radius": "var(--oc-radius-md)",
          outline: "none",
          transition: "background 100ms ease",
        }}
        onMouseEnter={(e: MouseEvent) => {
          (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
        }}
        onMouseLeave={(e: MouseEvent) => {
          (e.currentTarget as HTMLElement).style.background = "transparent"
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: "transform 200ms ease", "flex-shrink": "0" }}>
          <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {local.title}
      </KobalteCollapsible.Trigger>
      <KobalteCollapsible.Content
        style={{
          padding: "4px 10px 10px 26px",
          overflow: "hidden",
          animation: "oc-collapse-open 200ms ease",
        }}
      >
        <style>{`@keyframes oc-collapse-open { from { height: 0; opacity: 0; } to { height: var(--kb-collapsible-content-height); opacity: 1; } }`}</style>
        {local.children}
      </KobalteCollapsible.Content>
    </KobalteCollapsible>
  )
}
