import { Component, createSignal, Show } from "solid-js"
import type { Session } from "~/lib/types"
import { useServer } from "~/context/server"
import { Button } from "~/ui/components/button"
import { Spinner } from "~/ui/components/spinner"

export interface SessionHeaderProps {
  session: Session
  onToggleReview: () => void
  reviewVisible: boolean
}

export const SessionHeader: Component<SessionHeaderProps> = (props) => {
  const server = useServer()
  const [editingTitle, setEditingTitle] = createSignal(false)
  const [titleDraft, setTitleDraft] = createSignal("")
  const [sharing, setSharing] = createSignal(false)
  const [forking, setForking] = createSignal(false)

  function startEditTitle() {
    setTitleDraft(props.session.title || "")
    setEditingTitle(true)
  }

  async function saveTitle() {
    setEditingTitle(false)
    const newTitle = titleDraft().trim()
    if (newTitle && newTitle !== props.session.title) {
      try {
        await server.sdk.updateSession(props.session.id, { title: newTitle } as Partial<Session>)
      } catch {
        // title update failed
      }
    }
  }

  function handleTitleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      saveTitle()
    }
    if (e.key === "Escape") {
      setEditingTitle(false)
    }
  }

  async function handleShare() {
    setSharing(true)
    try {
      const result = await server.sdk.shareSession(props.session.id)
      if (result.url) {
        await navigator.clipboard.writeText(result.url)
      }
    } catch {
      // share failed
    } finally {
      setSharing(false)
    }
  }

  async function handleFork() {
    setForking(true)
    try {
      await server.sdk.forkSession(props.session.id)
    } catch {
      // fork failed
    } finally {
      setForking(false)
    }
  }

  async function handleDelete() {
    try {
      await server.sdk.deleteSession(props.session.id)
    } catch {
      // delete failed
    }
  }

  return (
    <div
      style={{
        display: "flex",
        "align-items": "center",
        gap: "12px",
        padding: "8px 16px",
        "border-bottom": "1px solid var(--oc-border-primary)",
        background: "var(--oc-bg-primary)",
        "flex-shrink": "0",
        "min-height": "44px",
      }}
    >
      {/* Session title */}
      <Show
        when={!editingTitle()}
        fallback={
          <input
            type="text"
            value={titleDraft()}
            onInput={(e) => setTitleDraft(e.currentTarget.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={saveTitle}
            autofocus
            style={{
              flex: "1",
              padding: "2px 6px",
              background: "var(--oc-surface-primary)",
              border: "1px solid var(--oc-border-focus)",
              "border-radius": "var(--oc-radius-sm)",
              color: "var(--oc-text-primary)",
              "font-size": "14px",
              "font-weight": "600",
              "font-family": "var(--oc-font-sans)",
              outline: "none",
            }}
          />
        }
      >
        <button
          onClick={startEditTitle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 4px",
            "border-radius": "var(--oc-radius-sm)",
            "font-size": "14px",
            "font-weight": "600",
            color: "var(--oc-text-primary)",
            "font-family": "var(--oc-font-sans)",
            overflow: "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            "max-width": "300px",
            "text-align": "left",
            transition: "background 100ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--oc-bg-hover)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none"
          }}
          title="Click to edit title"
        >
          {props.session.title || "Untitled Session"}
        </button>
      </Show>

      {/* Model badge */}
      <span
        style={{
          "font-size": "11px",
          padding: "2px 8px",
          "border-radius": "var(--oc-radius-sm)",
          background: "var(--oc-surface-secondary)",
          color: "var(--oc-text-secondary)",
          "font-family": "var(--oc-font-mono)",
          "flex-shrink": "0",
        }}
      >
        {props.session.model.model}
      </span>

      {/* Status indicator */}
      <Show when={props.session.status === "running"}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "4px",
            color: "var(--oc-warning)",
            "flex-shrink": "0",
          }}
        >
          <Spinner size="sm" />
          <span style={{ "font-size": "11px" }}>Running</span>
        </div>
      </Show>
      <Show when={props.session.status === "error"}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "4px",
            "flex-shrink": "0",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              "border-radius": "50%",
              background: "var(--oc-error)",
            }}
          />
          <span style={{ "font-size": "11px", color: "var(--oc-error)" }}>Error</span>
        </div>
      </Show>

      {/* Spacer */}
      <div style={{ flex: "1" }} />

      {/* Actions */}
      <div style={{ display: "flex", "align-items": "center", gap: "4px" }}>
        {/* Toggle review panel */}
        <Button
          variant={props.reviewVisible ? "secondary" : "ghost"}
          size="sm"
          onClick={props.onToggleReview}
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Review
        </Button>

        {/* Share */}
        <Button variant="ghost" size="sm" loading={sharing()} onClick={handleShare}>
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
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </Button>

        {/* Fork */}
        <Button variant="ghost" size="sm" loading={forking()} onClick={handleFork}>
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
            <circle cx="12" cy="18" r="3" />
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="6" r="3" />
            <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
            <path d="M12 12v3" />
          </svg>
        </Button>

        {/* Delete */}
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style={{ color: "var(--oc-error)" }}
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
