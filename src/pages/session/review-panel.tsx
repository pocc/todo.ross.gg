import { Component, createSignal, Show, For } from "solid-js"
import type { FileDiff, DiffHunk, DiffLine } from "~/lib/types"

export interface ReviewPanelProps {
  diffs: FileDiff[]
}

function statusBadge(status: FileDiff["status"]): { label: string; color: string; bg: string } {
  switch (status) {
    case "added":
      return { label: "A", color: "var(--oc-diff-add-text)", bg: "var(--oc-diff-add-bg)" }
    case "deleted":
      return { label: "D", color: "var(--oc-diff-del-text)", bg: "var(--oc-diff-del-bg)" }
    case "renamed":
      return { label: "R", color: "var(--oc-info)", bg: "rgba(96, 165, 250, 0.1)" }
    case "modified":
    default:
      return { label: "M", color: "var(--oc-warning)", bg: "rgba(251, 191, 36, 0.1)" }
  }
}

const DiffFileAccordion: Component<{ diff: FileDiff }> = (props) => {
  const [expanded, setExpanded] = createSignal(false)
  const badge = () => statusBadge(props.diff.status)

  return (
    <div
      style={{
        border: "1px solid var(--oc-border-secondary)",
        "border-radius": "var(--oc-radius-md)",
        overflow: "hidden",
        "margin-bottom": "6px",
      }}
    >
      {/* File header */}
      <button
        onClick={() => setExpanded(!expanded())}
        style={{
          display: "flex",
          "align-items": "center",
          gap: "8px",
          width: "100%",
          padding: "8px 10px",
          background: "var(--oc-surface-primary)",
          border: "none",
          cursor: "pointer",
          "text-align": "left",
          "font-family": "var(--oc-font-sans)",
          transition: "background 100ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--oc-bg-hover)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--oc-surface-primary)"
        }}
      >
        {/* Expand arrow */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style={{
            transform: expanded() ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 150ms ease",
            "flex-shrink": "0",
            color: "var(--oc-text-tertiary)",
          }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>

        {/* Status badge */}
        <span
          style={{
            "font-size": "10px",
            "font-weight": "600",
            padding: "1px 5px",
            "border-radius": "3px",
            color: badge().color,
            background: badge().bg,
            "flex-shrink": "0",
            "font-family": "var(--oc-font-mono)",
          }}
        >
          {badge().label}
        </span>

        {/* File path */}
        <span
          style={{
            "font-size": "12px",
            color: "var(--oc-text-primary)",
            "font-family": "var(--oc-font-mono)",
            overflow: "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            flex: "1",
            "min-width": "0",
          }}
        >
          {props.diff.path}
        </span>

        {/* +/- counts */}
        <div style={{ display: "flex", gap: "6px", "flex-shrink": "0" }}>
          <Show when={props.diff.additions > 0}>
            <span
              style={{
                "font-size": "11px",
                color: "var(--oc-diff-add-text)",
                "font-family": "var(--oc-font-mono)",
              }}
            >
              +{props.diff.additions}
            </span>
          </Show>
          <Show when={props.diff.deletions > 0}>
            <span
              style={{
                "font-size": "11px",
                color: "var(--oc-diff-del-text)",
                "font-family": "var(--oc-font-mono)",
              }}
            >
              -{props.diff.deletions}
            </span>
          </Show>
        </div>
      </button>

      {/* Diff content */}
      <Show when={expanded()}>
        <div
          style={{
            "border-top": "1px solid var(--oc-border-secondary)",
            "overflow-x": "auto",
          }}
        >
          <For each={props.diff.hunks}>
            {(hunk) => (
              <div>
                {/* Hunk header */}
                <div
                  style={{
                    padding: "4px 10px",
                    background: "var(--oc-surface-secondary)",
                    "font-size": "11px",
                    "font-family": "var(--oc-font-mono)",
                    color: "var(--oc-text-tertiary)",
                  }}
                >
                  @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                </div>
                {/* Lines */}
                <For each={hunk.lines}>
                  {(line) => {
                    const bgColor =
                      line.type === "add"
                        ? "var(--oc-diff-add-bg)"
                        : line.type === "del"
                          ? "var(--oc-diff-del-bg)"
                          : "transparent"
                    const textColor =
                      line.type === "add"
                        ? "var(--oc-diff-add-text)"
                        : line.type === "del"
                          ? "var(--oc-diff-del-text)"
                          : "var(--oc-text-secondary)"
                    const prefix =
                      line.type === "add" ? "+" : line.type === "del" ? "-" : " "

                    return (
                      <div
                        style={{
                          display: "flex",
                          background: bgColor,
                          "font-size": "12px",
                          "font-family": "var(--oc-font-mono)",
                          "line-height": "1.5",
                          "min-height": "20px",
                        }}
                      >
                        {/* Line numbers */}
                        <span
                          style={{
                            width: "40px",
                            "text-align": "right",
                            padding: "0 6px",
                            color: "var(--oc-text-disabled)",
                            "user-select": "none",
                            "flex-shrink": "0",
                            "font-size": "11px",
                          }}
                        >
                          {line.oldNumber ?? ""}
                        </span>
                        <span
                          style={{
                            width: "40px",
                            "text-align": "right",
                            padding: "0 6px",
                            color: "var(--oc-text-disabled)",
                            "user-select": "none",
                            "flex-shrink": "0",
                            "font-size": "11px",
                          }}
                        >
                          {line.newNumber ?? ""}
                        </span>
                        {/* Prefix */}
                        <span
                          style={{
                            width: "16px",
                            "text-align": "center",
                            color: textColor,
                            "user-select": "none",
                            "flex-shrink": "0",
                          }}
                        >
                          {prefix}
                        </span>
                        {/* Content */}
                        <span
                          style={{
                            color: textColor,
                            "white-space": "pre",
                            "padding-right": "12px",
                          }}
                        >
                          {line.content}
                        </span>
                      </div>
                    )
                  }}
                </For>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export const ReviewPanel: Component<ReviewPanelProps> = (props) => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        "flex-direction": "column",
        background: "var(--oc-bg-secondary)",
        "border-left": "1px solid var(--oc-border-primary)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          "border-bottom": "1px solid var(--oc-border-secondary)",
          display: "flex",
          "align-items": "center",
          "justify-content": "space-between",
          "flex-shrink": "0",
        }}
      >
        <span
          style={{
            "font-size": "12px",
            "font-weight": "600",
            color: "var(--oc-text-secondary)",
            "text-transform": "uppercase",
            "letter-spacing": "0.5px",
          }}
        >
          Changes
        </span>
        <span
          style={{
            "font-size": "11px",
            color: "var(--oc-text-tertiary)",
            "font-family": "var(--oc-font-mono)",
          }}
        >
          {props.diffs.length} {props.diffs.length === 1 ? "file" : "files"}
        </span>
      </div>

      {/* File list */}
      <div
        style={{
          flex: "1",
          "overflow-y": "auto",
          padding: "8px",
        }}
      >
        <Show
          when={props.diffs.length > 0}
          fallback={
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                "align-items": "center",
                "justify-content": "center",
                padding: "40px 16px",
                color: "var(--oc-text-tertiary)",
                "text-align": "center",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                style={{ opacity: "0.3", "margin-bottom": "12px" }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p style={{ "font-size": "13px" }}>No changes yet</p>
            </div>
          }
        >
          <For each={props.diffs}>
            {(diff) => <DiffFileAccordion diff={diff} />}
          </For>
        </Show>
      </div>
    </div>
  )
}
