import { Tooltip as KobalteTooltip } from "@kobalte/core/tooltip"
import { type JSX, type Component, splitProps } from "solid-js"

export interface TooltipProps {
  content: string
  children: JSX.Element
}

export const Tooltip: Component<TooltipProps> = (props) => {
  const [local] = splitProps(props, ["content", "children"])

  return (
    <KobalteTooltip gutter={6} openDelay={400} closeDelay={0}>
      <KobalteTooltip.Trigger as="span" style={{ display: "inline-flex" }}>
        {local.children}
      </KobalteTooltip.Trigger>
      <KobalteTooltip.Portal>
        <KobalteTooltip.Content
          style={{
            background: "var(--oc-bg-elevated)",
            color: "var(--oc-text-primary)",
            border: "1px solid var(--oc-border-primary)",
            "border-radius": "var(--oc-radius-sm)",
            padding: "4px 8px",
            "font-size": "11px",
            "font-family": "var(--oc-font-sans)",
            "box-shadow": "0 4px 12px rgba(0, 0, 0, 0.3)",
            "z-index": "1100",
            "white-space": "nowrap",
            animation: "oc-tooltip-in 100ms ease",
          }}
        >
          <style>{`@keyframes oc-tooltip-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
          <KobalteTooltip.Arrow size={6} />
          {local.content}
        </KobalteTooltip.Content>
      </KobalteTooltip.Portal>
    </KobalteTooltip>
  )
}
