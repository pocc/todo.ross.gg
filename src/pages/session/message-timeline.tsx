import { Component, For, Show, createEffect, onMount } from "solid-js"
import type { Message, AssistantMessage } from "~/lib/types"
import { Spinner } from "~/ui/components/spinner"
import { Markdown } from "~/ui/components/markdown"

interface Turn {
  user: Message | null
  assistant: AssistantMessage | null
}

function groupMessagesIntoTurns(messages: Message[]): Turn[] {
  const turns: Turn[] = []
  let currentTurn: Turn = { user: null, assistant: null }

  for (const msg of messages) {
    if (msg.role === "user") {
      if (currentTurn.user !== null) {
        turns.push(currentTurn)
        currentTurn = { user: null, assistant: null }
      }
      currentTurn.user = msg
    } else if (msg.role === "assistant") {
      currentTurn.assistant = msg as AssistantMessage
      turns.push(currentTurn)
      currentTurn = { user: null, assistant: null }
    }
  }

  if (currentTurn.user !== null || currentTurn.assistant !== null) {
    turns.push(currentTurn)
  }

  return turns
}

function extractTextContent(msg: Message): string {
  return msg.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; content: string }).content)
    .join("\n")
}

function extractToolCalls(msg: Message) {
  return msg.parts.filter((p) => p.type === "tool-invocation") as Array<{
    type: "tool-invocation"
    toolName: string
    toolCallId: string
    state: string
    args: Record<string, unknown>
    result?: unknown
  }>
}

export interface MessageTimelineProps {
  messages: Message[]
  loading: boolean
  onLoadMore: () => void
}

export const MessageTimeline: Component<MessageTimelineProps> = (props) => {
  let scrollRef: HTMLDivElement | undefined
  let shouldAutoScroll = true

  function scrollToBottom() {
    if (scrollRef && shouldAutoScroll) {
      scrollRef.scrollTop = scrollRef.scrollHeight
    }
  }

  createEffect(() => {
    // Track message count to trigger auto-scroll
    const _count = props.messages.length
    const lastMsg = props.messages[props.messages.length - 1]
    const _parts = lastMsg?.parts?.length
    requestAnimationFrame(scrollToBottom)
  })

  function handleScroll() {
    if (!scrollRef) return
    const distFromBottom =
      scrollRef.scrollHeight - scrollRef.scrollTop - scrollRef.clientHeight
    shouldAutoScroll = distFromBottom < 80
  }

  const turns = () => groupMessagesIntoTurns(props.messages)

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="log"
      aria-label="Conversation messages"
      style={{
        flex: "1",
        "overflow-y": "auto",
        "overflow-x": "hidden",
        padding: "16px 0",
      }}
    >
      {/* Load more */}
      <Show when={props.loading}>
        <div
          style={{
            display: "flex",
            "justify-content": "center",
            padding: "12px",
          }}
        >
          <Spinner size="sm" />
        </div>
      </Show>

      {/* Turns */}
      <For each={turns()}>
        {(turn, idx) => (
          <div
            style={{
              padding: "0 24px",
              "margin-bottom": "4px",
              "max-width": "720px",
              "margin-left": "auto",
              "margin-right": "auto",
              width: "100%",
            }}
          >
            {/* User message */}
            <Show when={turn.user}>
              {(userMsg) => (
                <div
                  style={{
                    padding: "12px 16px",
                    "margin-bottom": "2px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "8px",
                      "margin-bottom": "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        "border-radius": "50%",
                        background: "var(--oc-accent-primary)",
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "center",
                        "font-size": "11px",
                        "font-weight": "600",
                        color: "var(--oc-accent-text)",
                        "flex-shrink": "0",
                      }}
                    >
                      U
                    </div>
                    <span
                      style={{
                        "font-size": "13px",
                        "font-weight": "600",
                        color: "var(--oc-text-primary)",
                      }}
                    >
                      You
                    </span>
                  </div>
                  <div
                    style={{
                      "padding-left": "30px",
                      "font-size": "14px",
                      color: "var(--oc-text-primary)",
                      "line-height": "1.6",
                      "white-space": "pre-wrap",
                      "word-break": "break-word",
                    }}
                  >
                    {extractTextContent(userMsg())}
                  </div>
                </div>
              )}
            </Show>

            {/* Assistant message */}
            <Show when={turn.assistant}>
              {(assistantMsg) => (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "var(--oc-surface-primary)",
                    "border-radius": "var(--oc-radius-lg)",
                    "margin-bottom": "2px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "8px",
                      "margin-bottom": "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        "border-radius": "50%",
                        background: "var(--oc-success)",
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "center",
                        "font-size": "11px",
                        "font-weight": "600",
                        color: "#000",
                        "flex-shrink": "0",
                      }}
                    >
                      A
                    </div>
                    <span
                      style={{
                        "font-size": "13px",
                        "font-weight": "600",
                        color: "var(--oc-text-primary)",
                      }}
                    >
                      Assistant
                    </span>
                    <Show when={assistantMsg().metadata?.model}>
                      <span
                        style={{
                          "font-size": "12px",
                          color: "var(--oc-text-tertiary)",
                          "font-family": "var(--oc-font-mono)",
                        }}
                      >
                        {assistantMsg().metadata!.model}
                      </span>
                    </Show>
                  </div>

                  {/* Text content - rendered as markdown */}
                  <div style={{ "padding-left": "30px" }}>
                    <Markdown
                      content={extractTextContent(assistantMsg())}
                      streaming={assistantMsg().metadata?.status === "running"}
                    />
                  </div>

                  {/* Tool calls */}
                  <Show when={extractToolCalls(assistantMsg()).length > 0}>
                    <div
                      style={{
                        "padding-left": "30px",
                        "margin-top": "8px",
                        display: "flex",
                        "flex-direction": "column",
                        gap: "4px",
                      }}
                    >
                      <For each={extractToolCalls(assistantMsg())}>
                        {(tool) => (
                          <div
                            style={{
                              display: "flex",
                              "align-items": "center",
                              gap: "6px",
                              padding: "6px 10px",
                              background: "var(--oc-surface-secondary)",
                              "border-radius": "var(--oc-radius-sm)",
                              "font-family": "var(--oc-font-mono)",
                              "font-size": "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                "border-radius": "50%",
                                "flex-shrink": "0",
                                background:
                                  tool.state === "completed"
                                    ? "var(--oc-success)"
                                    : tool.state === "error"
                                      ? "var(--oc-error)"
                                      : tool.state === "running"
                                        ? "var(--oc-warning)"
                                        : "var(--oc-text-tertiary)",
                              }}
                            />
                            <span style={{ color: "var(--oc-syntax-function)" }}>
                              {tool.toolName}
                            </span>
                            <span style={{ color: "var(--oc-text-tertiary)" }}>
                              {tool.state === "completed" ? "done" : tool.state === "error" ? "failed" : tool.state}
                            </span>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>

                  {/* Token usage */}
                  <Show when={assistantMsg().metadata?.tokens}>
                    <div
                      style={{
                        "padding-left": "30px",
                        "margin-top": "8px",
                        "font-size": "12px",
                        color: "var(--oc-text-tertiary)",
                        "font-family": "var(--oc-font-mono)",
                      }}
                    >
                      {assistantMsg().metadata!.tokens!.input} in / {assistantMsg().metadata!.tokens!.output} out
                      <Show when={assistantMsg().metadata?.cost != null}>
                        {" "}
                        &middot; ${assistantMsg().metadata!.cost!.toFixed(4)}
                      </Show>
                    </div>
                  </Show>
                </div>
              )}
            </Show>
          </div>
        )}
      </For>

      {/* Empty state */}
      <Show when={props.messages.length === 0 && !props.loading}>
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            "justify-content": "center",
            padding: "64px 24px",
            color: "var(--oc-text-tertiary)",
            "text-align": "center",
          }}
        >
          <div
            style={{
              "font-size": "36px",
              "margin-bottom": "12px",
              opacity: "0.3",
              "font-family": "var(--oc-font-mono)",
            }}
          >
            {">>"}
          </div>
          <p style={{ "font-size": "14px" }}>
            Send a message to start the conversation
          </p>
        </div>
      </Show>
    </div>
  )
}
