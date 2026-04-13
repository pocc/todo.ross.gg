import { Component, Show, createEffect, createSignal } from "solid-js"
import { useParams, useNavigate } from "@solidjs/router"
import { SyncProvider, useSync } from "~/context/sync"
import { useServer } from "~/context/server"
import { useLayout } from "~/context/layout"
import { useGlobalSync } from "~/context/global-sync"
import { MessageTimeline } from "~/pages/session/message-timeline"
import { Composer } from "~/pages/session/composer"
import { ReviewPanel } from "~/pages/session/review-panel"
import { SessionHeader } from "~/pages/session/session-header"
import type { Session, MessagePart } from "~/lib/types"

const EmptySession: Component = () => {
  const params = useParams<{ dir: string }>()
  const navigate = useNavigate()
  const server = useServer()
  const [text, setText] = createSignal("")
  const [sending, setSending] = createSignal(false)
  const directory = () => {
    try { return atob(params.dir) } catch { return "" }
  }

  async function handleSend() {
    const msg = text().trim()
    if (!msg || sending()) return
    setSending(true)
    try {
      server.sdk.setDirectory(directory())
      const session = await server.sdk.createSession({})
      // Send the message
      await server.sdk.sendMessage(session.id, [{ type: "text", text: msg }])
      navigate(`/${params.dir}/session/${session.id}`)
    } catch {
      setSending(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "var(--oc-bg-primary)",
      }}
    >
      {/* Centered input */}
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          height: "100%",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            "max-width": "600px",
          }}
        >
          <div
            style={{
              background: "var(--oc-surface-primary)",
              border: "1px solid var(--oc-border-primary)",
              "border-radius": "var(--oc-radius-lg)",
              overflow: "hidden",
              "box-shadow": "0 2px 12px rgba(0,0,0,0.08)",
              transition: "border-color 150ms ease, box-shadow 150ms ease",
            }}
          >
            <textarea
              value={text()}
              onInput={(e) => setText(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to work on?"
              disabled={sending()}
              rows={4}
              style={{
                width: "100%",
                padding: "16px",
                background: "transparent",
                border: "none",
                color: "var(--oc-text-primary)",
                "font-size": "15px",
                "font-family": "var(--oc-font-sans)",
                "line-height": "1.5",
                resize: "none",
                outline: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                padding: "8px 12px",
                "border-top": "1px solid var(--oc-border-secondary)",
              }}
            >
              <span
                style={{
                  "font-size": "12px",
                  color: "var(--oc-text-disabled)",
                }}
              >
                Enter to send, Shift+Enter for newline
              </span>
              <button
                onClick={handleSend}
                disabled={!text().trim() || sending()}
                style={{
                  padding: "7px 18px",
                  background: text().trim() ? "var(--oc-accent-primary)" : "var(--oc-surface-secondary)",
                  color: text().trim() ? "var(--oc-accent-text)" : "var(--oc-text-disabled)",
                  border: "none",
                  "border-radius": "var(--oc-radius-md)",
                  "font-size": "13px",
                  "font-weight": "500",
                  "font-family": "var(--oc-font-sans)",
                  cursor: text().trim() ? "pointer" : "default",
                  transition: "background 100ms ease, color 100ms ease",
                  display: "flex",
                  "align-items": "center",
                  gap: "6px",
                }}
              >
                {sending() ? (
                  <div
                    class="animate-spin"
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid transparent",
                      "border-top-color": "currentColor",
                      "border-radius": "50%",
                    }}
                  />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SessionContent: Component = () => {
  const params = useParams<{ dir: string; id: string }>()
  const sync = useSync()
  const server = useServer()
  const layout = useLayout()
  const globalSync = useGlobalSync()

  const directory = () => {
    try {
      return atob(params.dir)
    } catch {
      return ""
    }
  }

  const session = (): Session | undefined => {
    const dir = directory()
    const sessions = globalSync.sessions[dir]
    if (!sessions) return undefined
    return sessions.find((s) => s.id === params.id)
  }

  const modelName = () => {
    const s = session()
    return s?.model?.model ?? ""
  }

  const isRunning = () => session()?.status === "running"

  async function handleSendMessage(parts: MessagePart[]) {
    await sync.sendMessage(parts)
  }

  async function handleAbort() {
    try {
      await server.sdk.abortSession(params.id)
    } catch {
      // abort failed
    }
  }

  createEffect(() => {
    if (layout.layout.reviewPanelVisible) {
      sync.loadDiffs()
    }
  })

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: "1",
          display: "flex",
          "flex-direction": "column",
          "min-width": "0",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Show when={session()}>
          {(s) => (
            <SessionHeader
              session={s()}
              onToggleReview={layout.toggleReviewPanel}
              reviewVisible={layout.layout.reviewPanelVisible}
            />
          )}
        </Show>

        <Show when={session()?.status === "error"}>
          <div
            style={{
              padding: "8px 16px",
              background: "var(--oc-diff-del-bg)",
              "border-bottom": "1px solid var(--oc-error)",
              "font-size": "13px",
              color: "var(--oc-error)",
              display: "flex",
              "align-items": "center",
              gap: "8px",
              "flex-shrink": "0",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Session encountered an error. You can retry by sending a new message.
          </div>
        </Show>

        <MessageTimeline
          messages={sync.messages}
          loading={sync.loading}
          onLoadMore={sync.loadMore}
        />

        <Composer
          disabled={false}
          modelName={modelName()}
          isRunning={isRunning()}
          onSubmit={handleSendMessage}
          onAbort={handleAbort}
        />
      </div>

      <Show when={layout.layout.reviewPanelVisible}>
        <div
          style={{
            width: `${layout.layout.reviewPanelWidth}px`,
            "flex-shrink": "0",
            height: "100%",
          }}
        >
          <ReviewPanel diffs={sync.diffs} />
        </div>
      </Show>
    </div>
  )
}

export const SessionPage: Component = () => {
  const params = useParams<{ dir: string; id?: string }>()

  return (
    <Show
      when={params.id}
      fallback={<EmptySession />}
    >
      {(id) => (
        <SyncProvider sessionId={id()}>
          <SessionContent />
        </SyncProvider>
      )}
    </Show>
  )
}
