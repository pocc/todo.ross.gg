import { type Component, Show } from "solid-js"
import { useServer } from "~/context/server"
import { useModels } from "~/context/models"

export const StatusPopover: Component = () => {
  const server = useServer()
  const models = useModels()

  const rowStyle = {
    display: "flex",
    "justify-content": "space-between",
    "align-items": "center",
    padding: "6px 0",
    "font-size": "12px",
  }

  const labelStyle = {
    color: "var(--oc-text-tertiary)",
  }

  const valueStyle = {
    color: "var(--oc-text-primary)",
    "font-family": "var(--oc-font-mono)",
    "font-size": "11px",
  }

  return (
    <div
      style={{
        width: "280px",
        padding: "12px 14px",
        background: "var(--oc-bg-elevated)",
        border: "1px solid var(--oc-border-primary)",
        "border-radius": "var(--oc-radius-lg)",
        "box-shadow": "0 8px 24px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          "font-size": "12px",
          "font-weight": "600",
          color: "var(--oc-text-primary)",
          "margin-bottom": "8px",
          "padding-bottom": "8px",
          "border-bottom": "1px solid var(--oc-border-primary)",
        }}
      >
        Server Status
      </div>

      {/* Connection status */}
      <div style={rowStyle}>
        <span style={labelStyle}>Status</span>
        <span
          style={{
            display: "inline-flex",
            "align-items": "center",
            gap: "6px",
            "font-size": "12px",
            color: server.connected ? "var(--oc-success)" : "var(--oc-error)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              "border-radius": "50%",
              background: server.connected ? "var(--oc-success)" : "var(--oc-error)",
            }}
          />
          {server.connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Server URL */}
      <div style={rowStyle}>
        <span style={labelStyle}>Server URL</span>
        <span
          style={{
            ...valueStyle,
            "max-width": "160px",
            overflow: "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
          }}
        >
          {server.serverUrl}
        </span>
      </div>

      {/* Current model */}
      <Show when={models.selectedProvider() && models.selectedModel()}>
        <div style={rowStyle}>
          <span style={labelStyle}>Model</span>
          <span style={valueStyle}>{models.selectedModel()}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Provider</span>
          <span style={valueStyle}>{models.selectedProvider()}</span>
        </div>
      </Show>

      {/* Error */}
      <Show when={server.error}>
        <div
          style={{
            "margin-top": "8px",
            padding: "6px 8px",
            "font-size": "11px",
            color: "var(--oc-error)",
            background: "var(--oc-surface-secondary)",
            "border-radius": "var(--oc-radius-sm)",
            border: "1px solid var(--oc-error)",
            "word-break": "break-word",
          }}
        >
          {server.error}
        </div>
      </Show>
    </div>
  )
}
