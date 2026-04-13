import { Dialog as KobalteDialog } from "@kobalte/core/dialog"
import { type JSX, type Component, splitProps, Show } from "solid-js"

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  children?: JSX.Element
}

export const Dialog: Component<DialogProps> = (props) => {
  const [local] = splitProps(props, ["open", "onOpenChange", "title", "description", "children"])

  return (
    <KobalteDialog open={local.open} onOpenChange={local.onOpenChange}>
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0, 0, 0, 0.6)",
            "z-index": "999",
            "backdrop-filter": "blur(2px)",
            animation: "oc-fade-in 150ms ease",
          }}
        />
        <KobalteDialog.Content
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            "z-index": "1000",
            background: "var(--oc-bg-elevated)",
            border: "1px solid var(--oc-border-primary)",
            "border-radius": "var(--oc-radius-xl)",
            padding: "24px",
            "min-width": "400px",
            "max-width": "560px",
            width: "90vw",
            "max-height": "85vh",
            overflow: "auto",
            "box-shadow": "0 16px 48px rgba(0, 0, 0, 0.4)",
            animation: "oc-dialog-in 200ms ease",
            outline: "none",
          }}
        >
          <style>{`
            @keyframes oc-fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes oc-dialog-in { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }
          `}</style>
          <div style={{ display: "flex", "align-items": "flex-start", "justify-content": "space-between", "margin-bottom": "16px" }}>
            <div>
              <Show when={local.title}>
                <KobalteDialog.Title
                  style={{
                    "font-size": "16px",
                    "font-weight": "600",
                    color: "var(--oc-text-primary)",
                    margin: "0",
                  }}
                >
                  {local.title}
                </KobalteDialog.Title>
              </Show>
              <Show when={local.description}>
                <KobalteDialog.Description
                  style={{
                    "font-size": "13px",
                    color: "var(--oc-text-secondary)",
                    "margin-top": "4px",
                  }}
                >
                  {local.description}
                </KobalteDialog.Description>
              </Show>
            </div>
            <KobalteDialog.CloseButton
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                width: "28px",
                height: "28px",
                "border-radius": "var(--oc-radius-sm)",
                background: "transparent",
                border: "none",
                color: "var(--oc-text-tertiary)",
                cursor: "pointer",
                "flex-shrink": "0",
              }}
              onMouseEnter={(e: MouseEvent) => {
                (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
              }}
              onMouseLeave={(e: MouseEvent) => {
                (e.currentTarget as HTMLElement).style.background = "transparent"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </KobalteDialog.CloseButton>
          </div>
          {local.children}
        </KobalteDialog.Content>
      </KobalteDialog.Portal>
    </KobalteDialog>
  )
}
