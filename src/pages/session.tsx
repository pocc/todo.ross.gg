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
import { SpaceViewport } from "~/components/space-viewport"
import type { Session, MessagePart } from "~/lib/types"

const EmptySession: Component = () => {
  const params = useParams<{ dir: string }>()
  const navigate = useNavigate()
  const server = useServer()
  const [text, setText] = createSignal("")
  const [sending, setSending] = createSignal(false)
  const [focused, setFocused] = createSignal(false)
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
        background: "#05060f",
        display: "flex",
        "flex-direction": "column",
      }}
    >
      {/* Viewport area — the space scene */}
      <div
        style={{
          position: "relative",
          flex: "1",
          "min-height": "0",
          overflow: "hidden",
        }}
      >
        <SpaceViewport />

        {/* Viewport frame overlay — subtle vignette like a ship window */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            "pointer-events": "none",
            "box-shadow": "inset 0 0 80px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.3)",
            "border-bottom": "1px solid rgba(80, 140, 200, 0.15)",
          }}
        />

        {/* HUD overlays */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "20px",
            "pointer-events": "none",
            "font-family": "var(--oc-font-mono)",
            "font-size": "10px",
            color: "rgba(100, 180, 255, 0.35)",
            "letter-spacing": "1.5px",
            "text-transform": "uppercase",
            "line-height": "1.8",
          }}
        >
          <div>SYS STATUS: NOMINAL</div>
          <div>NAV: CRUISING</div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "20px",
            "pointer-events": "none",
            "font-family": "var(--oc-font-mono)",
            "font-size": "10px",
            color: "rgba(100, 180, 255, 0.35)",
            "letter-spacing": "1.5px",
            "text-transform": "uppercase",
            "text-align": "right",
            "line-height": "1.8",
          }}
        >
          <div>SECTOR 7G-ROSS</div>
          <div>WARP 0.2c</div>
        </div>

        {/* Thin scanline effect */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            "pointer-events": "none",
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)",
            opacity: "0.5",
          }}
        />
      </div>

      {/* Control panel — bottom section */}
      <div
        style={{
          "flex-shrink": "0",
          background: "linear-gradient(180deg, #0a0d1a 0%, #080b15 100%)",
          "border-top": "1px solid rgba(80, 140, 200, 0.2)",
          padding: "0",
          position: "relative",
        }}
      >
        {/* Panel decoration strip */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, rgba(60, 130, 200, 0.3) 20%, rgba(60, 130, 200, 0.5) 50%, rgba(60, 130, 200, 0.3) 80%, transparent 100%)",
          }}
        />

        {/* Status indicators row */}
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
            padding: "8px 16px 4px",
          }}
        >
          <div
            style={{
              display: "flex",
              "align-items": "center",
              gap: "16px",
            }}
          >
            {[
              { label: "COMM", color: "#4ade80" },
              { label: "NAV", color: "#4ade80" },
              { label: "SHIELD", color: "#facc15" },
            ].map((ind) => (
              <div style={{ display: "flex", "align-items": "center", gap: "5px" }}>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    "border-radius": "50%",
                    background: ind.color,
                    "box-shadow": `0 0 6px ${ind.color}`,
                  }}
                />
                <span
                  style={{
                    "font-family": "var(--oc-font-mono)",
                    "font-size": "9px",
                    color: "rgba(140, 180, 220, 0.5)",
                    "letter-spacing": "1px",
                    "text-transform": "uppercase",
                  }}
                >
                  {ind.label}
                </span>
              </div>
            ))}
          </div>
          <span
            style={{
              "font-family": "var(--oc-font-mono)",
              "font-size": "9px",
              color: "rgba(140, 180, 220, 0.4)",
              "letter-spacing": "1px",
            }}
          >
            COMMS TERMINAL
          </span>
        </div>

        {/* Input area */}
        <div style={{ padding: "6px 12px 12px" }}>
          <div
            style={{
              background: "rgba(15, 20, 35, 0.9)",
              border: focused()
                ? "1px solid rgba(80, 160, 255, 0.4)"
                : "1px solid rgba(60, 100, 160, 0.2)",
              "border-radius": "8px",
              overflow: "hidden",
              "box-shadow": focused()
                ? "0 0 20px rgba(60, 140, 220, 0.08), inset 0 1px 0 rgba(80, 140, 200, 0.1)"
                : "inset 0 1px 0 rgba(80, 140, 200, 0.05)",
              transition: "border-color 200ms ease, box-shadow 200ms ease",
            }}
          >
            <textarea
              value={text()}
              onInput={(e) => setText(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter command..."
              disabled={sending()}
              rows={3}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "transparent",
                border: "none",
                color: "#c8ddf0",
                "font-size": "14px",
                "font-family": "var(--oc-font-mono)",
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
                padding: "6px 10px",
                "border-top": "1px solid rgba(60, 100, 160, 0.12)",
              }}
            >
              <span
                style={{
                  "font-size": "10px",
                  "font-family": "var(--oc-font-mono)",
                  color: "rgba(100, 150, 200, 0.3)",
                  "letter-spacing": "0.5px",
                }}
              >
                ENTER to transmit / SHIFT+ENTER newline
              </span>
              <button
                onClick={handleSend}
                disabled={!text().trim() || sending()}
                style={{
                  padding: "5px 16px",
                  background: text().trim()
                    ? "linear-gradient(180deg, rgba(50, 130, 220, 0.8) 0%, rgba(40, 100, 180, 0.8) 100%)"
                    : "rgba(50, 80, 120, 0.15)",
                  color: text().trim() ? "#e0f0ff" : "rgba(100, 150, 200, 0.3)",
                  border: text().trim()
                    ? "1px solid rgba(80, 160, 255, 0.3)"
                    : "1px solid rgba(60, 100, 160, 0.1)",
                  "border-radius": "4px",
                  "font-size": "11px",
                  "font-weight": "600",
                  "font-family": "var(--oc-font-mono)",
                  "letter-spacing": "1.5px",
                  "text-transform": "uppercase",
                  cursor: text().trim() ? "pointer" : "default",
                  transition: "all 150ms ease",
                  display: "flex",
                  "align-items": "center",
                  gap: "6px",
                  "box-shadow": text().trim() ? "0 0 12px rgba(50, 130, 220, 0.2)" : "none",
                }}
              >
                {sending() ? (
                  <div
                    class="animate-spin"
                    style={{
                      width: "12px",
                      height: "12px",
                      border: "2px solid transparent",
                      "border-top-color": "currentColor",
                      "border-radius": "50%",
                    }}
                  />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                )}
                Transmit
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
