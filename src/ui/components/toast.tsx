import { type JSX, type Component, splitProps, createSignal, onMount, onCleanup, Show } from "solid-js"

export interface ToastProps {
  title?: string
  description?: string
  type?: "success" | "error" | "info" | "warning"
  onDismiss?: () => void
  duration?: number
}

const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: "rgba(52, 211, 153, 0.1)", border: "var(--oc-success)", icon: "var(--oc-success)" },
  error: { bg: "rgba(248, 113, 113, 0.1)", border: "var(--oc-error)", icon: "var(--oc-error)" },
  info: { bg: "rgba(96, 165, 250, 0.1)", border: "var(--oc-info)", icon: "var(--oc-info)" },
  warning: { bg: "rgba(251, 191, 36, 0.1)", border: "var(--oc-warning)", icon: "var(--oc-warning)" },
}

const typeIcons: Record<string, string> = {
  success: "M5 13l4 4L19 7",
  error: "M6 18L18 6M6 6l12 12",
  info: "M12 16v-4m0-4h.01",
  warning: "M12 9v4m0 4h.01",
}

export const Toast: Component<ToastProps> = (props) => {
  const [local] = splitProps(props, ["title", "description", "type", "onDismiss", "duration"])
  const [visible, setVisible] = createSignal(true)
  const t = () => local.type ?? "info"
  const colors = () => typeColors[t()]

  let timer: ReturnType<typeof setTimeout> | undefined

  onMount(() => {
    timer = setTimeout(() => {
      setVisible(false)
      local.onDismiss?.()
    }, local.duration ?? 5000)
  })

  onCleanup(() => {
    if (timer) clearTimeout(timer)
  })

  return (
    <Show when={visible()}>
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          "z-index": "2000",
          background: "var(--oc-bg-elevated)",
          border: `1px solid ${colors().border}`,
          "border-left": `3px solid ${colors().border}`,
          "border-radius": "var(--oc-radius-md)",
          padding: "12px 16px",
          "min-width": "280px",
          "max-width": "400px",
          "box-shadow": "0 8px 24px rgba(0, 0, 0, 0.3)",
          animation: "oc-toast-in 200ms ease",
          display: "flex",
          gap: "10px",
          "align-items": "flex-start",
        }}
      >
        <style>{`@keyframes oc-toast-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ "flex-shrink": "0", "margin-top": "1px" }}>
          <path d={typeIcons[t()]} stroke={colors().icon} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div style={{ flex: "1", "min-width": "0" }}>
          <Show when={local.title}>
            <div style={{ "font-size": "13px", "font-weight": "600", color: "var(--oc-text-primary)" }}>
              {local.title}
            </div>
          </Show>
          <Show when={local.description}>
            <div style={{ "font-size": "12px", color: "var(--oc-text-secondary)", "margin-top": local.title ? "2px" : "0" }}>
              {local.description}
            </div>
          </Show>
        </div>
        <button
          onClick={() => {
            setVisible(false)
            local.onDismiss?.()
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--oc-text-tertiary)",
            cursor: "pointer",
            padding: "0",
            "flex-shrink": "0",
            display: "flex",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </Show>
  )
}
