import { type Component, splitProps } from "solid-js"

export interface ToolErrorCardProps {
  error: string
  toolName: string
}

export const ToolErrorCard: Component<ToolErrorCardProps> = (props) => {
  const [local] = splitProps(props, ["error", "toolName"])

  return (
    <div
      style={{
        background: "rgba(248, 113, 113, 0.06)",
        border: "1px solid var(--oc-error)",
        "border-radius": "var(--oc-radius-md)",
        padding: "10px 12px",
        "font-size": "12px",
      }}
    >
      <div style={{ display: "flex", "align-items": "center", gap: "6px", "margin-bottom": "6px" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="var(--oc-error)" stroke-width="1.5" />
          <path d="M7 4v3.5M7 9.5h.01" stroke="var(--oc-error)" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span style={{ "font-weight": "600", color: "var(--oc-error)", "font-family": "var(--oc-font-mono)", "font-size": "11px" }}>
          {local.toolName}
        </span>
      </div>
      <pre
        style={{
          "font-family": "var(--oc-font-mono)",
          "font-size": "11px",
          color: "var(--oc-text-secondary)",
          "white-space": "pre-wrap",
          "word-break": "break-word",
          margin: "0",
        }}
      >
        {local.error}
      </pre>
    </div>
  )
}
