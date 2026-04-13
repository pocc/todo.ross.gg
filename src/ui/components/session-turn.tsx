import { type Component, splitProps, Show, For, createSignal } from "solid-js"
import type { Message } from "~/lib/types"
import { MessagePart } from "./message-part"

export interface SessionTurnProps {
  userMessage: Message
  assistantMessage?: Message
  isLatest: boolean
}

export const SessionTurn: Component<SessionTurnProps> = (props) => {
  const [local] = splitProps(props, ["userMessage", "assistantMessage", "isLatest"])
  const [collapsed, setCollapsed] = createSignal(false)

  const userText = () => {
    const textPart = local.userMessage.parts.find((p) => p.type === "text")
    return textPart && textPart.type === "text" ? textPart.content : ""
  }

  const isLong = () => userText().length > 500

  const metadata = () => {
    if (local.assistantMessage?.role === "assistant") {
      return local.assistantMessage.metadata
    }
    return undefined
  }

  const formatCost = (cost: number): string => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`
    return `$${cost.toFixed(2)}`
  }

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "12px", padding: "0" }}>
      {/* User message */}
      <div style={{ display: "flex", "justify-content": "flex-end" }}>
        <div
          style={{
            background: "var(--oc-accent-primary)",
            color: "var(--oc-accent-text)",
            "border-radius": "var(--oc-radius-lg) var(--oc-radius-lg) var(--oc-radius-sm) var(--oc-radius-lg)",
            padding: "8px 14px",
            "max-width": "80%",
            "font-size": "13px",
            "line-height": "1.5",
            "word-break": "break-word",
            "white-space": "pre-wrap",
          }}
        >
          <Show when={isLong() && collapsed()}>
            <div>{userText().slice(0, 300)}...</div>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                "font-size": "12px",
                padding: "4px 0 0",
                "text-decoration": "underline",
              }}
            >
              Show more
            </button>
          </Show>
          <Show when={!collapsed()}>
            <div>{userText()}</div>
            <Show when={isLong()}>
              <button
                onClick={() => setCollapsed(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  "font-size": "12px",
                  padding: "4px 0 0",
                  "text-decoration": "underline",
                }}
              >
                Show less
              </button>
            </Show>
          </Show>
          {/* Render non-text user parts (files, etc.) */}
          <For each={local.userMessage.parts.filter((p) => p.type !== "text")}>
            {(part) => <MessagePart part={part} />}
          </For>
        </div>
      </div>

      {/* Assistant message */}
      <Show when={local.assistantMessage}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
          <div
            style={{
              "max-width": "100%",
              "font-size": "13px",
              "line-height": "1.5",
            }}
          >
            <For each={local.assistantMessage!.parts}>
              {(part) => <MessagePart part={part} />}
            </For>
          </div>

          {/* Metadata footer */}
          <Show when={metadata()}>
            <div
              style={{
                display: "flex",
                "align-items": "center",
                gap: "12px",
                "font-size": "11px",
                color: "var(--oc-text-tertiary)",
                "padding-top": "4px",
              }}
            >
              <Show when={metadata()?.model}>
                <span>{metadata()!.model}</span>
              </Show>
              <Show when={metadata()?.tokens}>
                <span>
                  {metadata()!.tokens!.input + metadata()!.tokens!.output} tokens
                </span>
              </Show>
              <Show when={metadata()?.cost !== undefined}>
                <span>{formatCost(metadata()!.cost!)}</span>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}
