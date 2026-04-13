import { type Component, splitProps, Show, Switch, Match, createSignal } from "solid-js"
import type { MessagePart as MessagePartType, TextPart, ToolInvocationPart, FilePart, ReasoningPart } from "~/lib/types"
import { Markdown } from "./markdown"
import { ToolStatusTitle } from "./tool-status-title"
import { ToolErrorCard } from "./tool-error-card"
import { Spinner } from "./spinner"
import { Collapsible } from "./collapsible"

export interface MessagePartProps {
  part: MessagePartType
}

export const MessagePart: Component<MessagePartProps> = (props) => {
  const [local] = splitProps(props, ["part"])

  const stateStyle = (): Record<string, string> => {
    const p = local.part
    if ("state" in p) {
      switch (p.state) {
        case "pending":
          return { opacity: "0.5" }
        case "running":
          return { animation: "oc-pulse 1.5s ease infinite" }
        case "error":
          return { "border-left": "2px solid var(--oc-error)", "padding-left": "8px" }
        default:
          return {}
      }
    }
    return {}
  }

  return (
    <div style={{ ...stateStyle() }}>
      <style>{`@keyframes oc-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }`}</style>
      <Switch>
        <Match when={local.part.type === "text"}>
          <TextPartView part={local.part as TextPart} />
        </Match>
        <Match when={local.part.type === "tool-invocation"}>
          <ToolInvocationPartView part={local.part as ToolInvocationPart} />
        </Match>
        <Match when={local.part.type === "file"}>
          <FilePartView part={local.part as FilePart} />
        </Match>
        <Match when={local.part.type === "reasoning"}>
          <ReasoningPartView part={local.part as ReasoningPart} />
        </Match>
      </Switch>
    </div>
  )
}

const TextPartView: Component<{ part: TextPart }> = (props) => {
  return (
    <Markdown
      content={props.part.content}
      streaming={props.part.state === "running"}
    />
  )
}

const ToolInvocationPartView: Component<{ part: ToolInvocationPart }> = (props) => {
  const [expanded, setExpanded] = createSignal(false)

  const argsPreview = (): string => {
    try {
      const str = JSON.stringify(props.part.args, null, 2)
      return str.length > 200 ? str.slice(0, 200) + "..." : str
    } catch {
      return "{}"
    }
  }

  const resultPreview = (): string => {
    if (!props.part.result) return ""
    try {
      const str = typeof props.part.result === "string"
        ? props.part.result
        : JSON.stringify(props.part.result, null, 2)
      return str.length > 500 ? str.slice(0, 500) + "..." : str
    } catch {
      return String(props.part.result)
    }
  }

  return (
    <div
      style={{
        background: "var(--oc-surface-primary)",
        border: `1px solid ${props.part.state === "error" ? "var(--oc-error)" : "var(--oc-border-primary)"}`,
        "border-radius": "var(--oc-radius-md)",
        overflow: "hidden",
        "margin": "6px 0",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded()}
        aria-label={`${expanded() ? "Collapse" : "Expand"} ${props.part.toolName} details`}
        onClick={() => setExpanded(!expanded())}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(!expanded()) }
        }}
        style={{
          display: "flex",
          "align-items": "center",
          "justify-content": "space-between",
          padding: "8px 10px",
          cursor: "pointer",
          "user-select": "none",
        }}
        onMouseEnter={(e: MouseEvent) => {
          (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
        }}
        onMouseLeave={(e: MouseEvent) => {
          (e.currentTarget as HTMLElement).style.background = "transparent"
        }}
      >
        <ToolStatusTitle toolName={props.part.toolName} state={props.part.state} />
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: expanded() ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 150ms ease",
          }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="var(--oc-text-tertiary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <Show when={expanded()}>
        <div style={{ padding: "0 10px 10px", "border-top": "1px solid var(--oc-border-secondary)" }}>
          <div style={{ "margin-top": "8px" }}>
            <div style={{ "font-size": "11px", "font-weight": "500", color: "var(--oc-text-tertiary)", "margin-bottom": "4px" }}>Arguments</div>
            <pre
              style={{
                "font-family": "var(--oc-font-mono)",
                "font-size": "11px",
                color: "var(--oc-text-secondary)",
                background: "var(--oc-surface-secondary)",
                padding: "8px",
                "border-radius": "var(--oc-radius-sm)",
                overflow: "auto",
                "max-height": "200px",
                margin: "0",
                "white-space": "pre-wrap",
                "word-break": "break-word",
              }}
            >
              {argsPreview()}
            </pre>
          </div>
          <Show when={props.part.result !== undefined}>
            <div style={{ "margin-top": "8px" }}>
              <div style={{ "font-size": "11px", "font-weight": "500", color: "var(--oc-text-tertiary)", "margin-bottom": "4px" }}>Result</div>
              <pre
                style={{
                  "font-family": "var(--oc-font-mono)",
                  "font-size": "11px",
                  color: "var(--oc-text-secondary)",
                  background: "var(--oc-surface-secondary)",
                  padding: "8px",
                  "border-radius": "var(--oc-radius-sm)",
                  overflow: "auto",
                  "max-height": "300px",
                  margin: "0",
                  "white-space": "pre-wrap",
                  "word-break": "break-word",
                }}
              >
                {resultPreview()}
              </pre>
            </div>
          </Show>
          <Show when={props.part.state === "error" && props.part.diagnostics?.length}>
            <div style={{ "margin-top": "8px" }}>
              <ToolErrorCard
                toolName={props.part.toolName}
                error={props.part.diagnostics!.map((d) => d.message).join("\n")}
              />
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}

const FilePartView: Component<{ part: FilePart }> = (props) => {
  return (
    <div
      style={{
        display: "inline-flex",
        "align-items": "center",
        gap: "8px",
        padding: "8px 12px",
        background: "var(--oc-surface-primary)",
        border: "1px solid var(--oc-border-primary)",
        "border-radius": "var(--oc-radius-md)",
        "margin": "4px 0",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 2h5l3 3v9H4V2z" stroke="var(--oc-text-tertiary)" stroke-width="1.2" stroke-linejoin="round" />
        <path d="M9 2v3h3" stroke="var(--oc-text-tertiary)" stroke-width="1.2" stroke-linejoin="round" />
      </svg>
      <div>
        <div style={{ "font-size": "12px", "font-weight": "500", color: "var(--oc-text-primary)" }}>
          {props.part.filename}
        </div>
        <div style={{ "font-size": "11px", color: "var(--oc-text-tertiary)" }}>
          {props.part.mediaType}
        </div>
      </div>
    </div>
  )
}

const ReasoningPartView: Component<{ part: ReasoningPart }> = (props) => {
  return (
    <Show
      when={!props.part.redacted}
      fallback={
        <div style={{ "font-size": "12px", color: "var(--oc-text-tertiary)", "font-style": "italic", padding: "4px 0" }}>
          Reasoning (redacted)
        </div>
      }
    >
      <Collapsible title="Thinking" defaultOpen={false}>
        <div
          style={{
            background: "var(--oc-surface-primary)",
            "border-radius": "var(--oc-radius-sm)",
            padding: "8px 10px",
            "font-size": "12px",
            color: "var(--oc-text-secondary)",
            "line-height": "1.5",
            "white-space": "pre-wrap",
            "word-break": "break-word",
          }}
        >
          {props.part.content}
        </div>
      </Collapsible>
    </Show>
  )
}
