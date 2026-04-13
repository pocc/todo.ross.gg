import { Component, Show, createEffect, createSignal, onMount } from "solid-js"
import { useParams } from "@solidjs/router"
import { SyncProvider, useSync } from "~/context/sync"
import { useServer } from "~/context/server"
import { useLayout } from "~/context/layout"
import { useGlobalSync } from "~/context/global-sync"
import { MessageTimeline } from "~/pages/session/message-timeline"
import { Composer } from "~/pages/session/composer"
import { ReviewPanel } from "~/pages/session/review-panel"
import { SessionHeader } from "~/pages/session/session-header"
import type { Session, MessagePart } from "~/lib/types"

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

  // Load diffs when review panel becomes visible
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
      {/* Main chat area */}
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
        {/* Session header */}
        <Show when={session()}>
          {(s) => (
            <SessionHeader
              session={s()}
              onToggleReview={layout.toggleReviewPanel}
              reviewVisible={layout.layout.reviewPanelVisible}
            />
          )}
        </Show>

        {/* Error banner */}
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Session encountered an error. You can retry by sending a new message.
          </div>
        </Show>

        {/* Message timeline */}
        <MessageTimeline
          messages={sync.messages}
          loading={sync.loading}
          onLoadMore={sync.loadMore}
        />

        {/* Composer */}
        <Composer
          disabled={false}
          modelName={modelName()}
          isRunning={isRunning()}
          onSubmit={handleSendMessage}
          onAbort={handleAbort}
        />
      </div>

      {/* Review panel */}
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
      fallback={
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            "justify-content": "center",
            height: "100%",
            color: "var(--oc-text-tertiary)",
            "text-align": "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              "border-radius": "12px",
              background: "var(--oc-surface-secondary)",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "margin-bottom": "16px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style={{ opacity: "0.4" }}
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p style={{ "font-size": "15px", "font-weight": "500", "margin-bottom": "4px" }}>
            Select or create a session
          </p>
          <p style={{ "font-size": "13px" }}>
            Choose a session from the sidebar or create a new one to get started
          </p>
        </div>
      }
    >
      {(id) => (
        <SyncProvider sessionId={id()}>
          <SessionContent />
        </SyncProvider>
      )}
    </Show>
  )
}
