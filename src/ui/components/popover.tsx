import { Popover as KobaltePopover } from "@kobalte/core/popover"
import { type JSX, type Component, splitProps } from "solid-js"

export interface PopoverProps {
  trigger: JSX.Element
  children?: JSX.Element
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Popover: Component<PopoverProps> = (props) => {
  const [local] = splitProps(props, ["trigger", "children", "open", "onOpenChange"])

  return (
    <KobaltePopover open={local.open} onOpenChange={local.onOpenChange} gutter={8}>
      <KobaltePopover.Trigger as="div" style={{ display: "inline-flex" }}>
        {local.trigger}
      </KobaltePopover.Trigger>
      <KobaltePopover.Portal>
        <KobaltePopover.Content
          style={{
            background: "var(--oc-bg-elevated)",
            border: "1px solid var(--oc-border-primary)",
            "border-radius": "var(--oc-radius-lg)",
            padding: "12px",
            "box-shadow": "0 8px 24px rgba(0, 0, 0, 0.3)",
            "z-index": "1000",
            "min-width": "200px",
            animation: "oc-pop-in 150ms ease",
            outline: "none",
          }}
        >
          <style>{`@keyframes oc-pop-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <KobaltePopover.Arrow size={8} />
          {local.children}
        </KobaltePopover.Content>
      </KobaltePopover.Portal>
    </KobaltePopover>
  )
}
