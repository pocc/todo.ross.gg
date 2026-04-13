import { Component, createSignal, Show, For, onMount } from "solid-js"
import type { MessagePart } from "~/lib/types"
import { Button } from "~/ui/components/button"

interface AttachedFile {
  name: string
  path: string
}

export interface ComposerProps {
  disabled: boolean
  modelName: string
  onSubmit: (parts: MessagePart[]) => void
  onAbort: () => void
  isRunning: boolean
}

export const Composer: Component<ComposerProps> = (props) => {
  const [text, setText] = createSignal("")
  const [files, setFiles] = createSignal<AttachedFile[]>([])
  let textareaRef: HTMLTextAreaElement | undefined

  function autoResize() {
    if (!textareaRef) return
    textareaRef.style.height = "auto"
    const maxHeight = 200
    textareaRef.style.height = `${Math.min(textareaRef.scrollHeight, maxHeight)}px`
  }

  function handleInput(e: InputEvent & { currentTarget: HTMLTextAreaElement }) {
    setText(e.currentTarget.value)
    autoResize()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleSubmit() {
    const trimmed = text().trim()
    if (!trimmed || props.disabled) return

    const parts: MessagePart[] = []

    // Add file parts
    for (const f of files()) {
      parts.push({
        type: "file",
        mediaType: "text/plain",
        url: f.path,
        filename: f.name,
      })
    }

    // Add text part
    parts.push({
      type: "text",
      content: trimmed,
      state: "done",
    })

    props.onSubmit(parts)
    setText("")
    setFiles([])
    if (textareaRef) {
      textareaRef.style.height = "auto"
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  onMount(() => {
    textareaRef?.focus()
  })

  return (
    <div
      style={{
        "flex-shrink": "0",
        padding: "12px 24px 16px",
        background: "var(--oc-bg-primary)",
        "border-top": "1px solid var(--oc-border-primary)",
      }}
    >
      {/* File attachments */}
      <Show when={files().length > 0}>
        <div
          style={{
            display: "flex",
            "flex-wrap": "wrap",
            gap: "6px",
            "margin-bottom": "8px",
          }}
        >
          <For each={files()}>
            {(file, idx) => (
              <div
                style={{
                  display: "flex",
                  "align-items": "center",
                  gap: "4px",
                  padding: "3px 8px",
                  background: "var(--oc-surface-secondary)",
                  "border-radius": "var(--oc-radius-sm)",
                  "font-size": "12px",
                  color: "var(--oc-text-secondary)",
                  "font-family": "var(--oc-font-mono)",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>{file.name}</span>
                <button
                  onClick={() => removeFile(idx())}
                  aria-label={`Remove ${file.name}`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--oc-text-tertiary)",
                    padding: "0 2px",
                    display: "flex",
                    "align-items": "center",
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Textarea */}
      <div
        style={{
          display: "flex",
          "align-items": "flex-end",
          gap: "8px",
          background: "var(--oc-surface-primary)",
          "border-radius": "var(--oc-radius-lg)",
          border: "1px solid var(--oc-border-primary)",
          padding: "8px 12px",
          transition: "border-color 150ms ease",
        }}
      >
        <textarea
          ref={textareaRef}
          value={text()}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          aria-label="Message input"
          disabled={props.isRunning}
          rows={1}
          style={{
            flex: "1",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            color: "var(--oc-text-primary)",
            "font-size": "14px",
            "font-family": "var(--oc-font-sans)",
            "line-height": "1.5",
            "min-height": "24px",
            "max-height": "200px",
            padding: "0",
          }}
          onFocus={(e) => {
            const parent = e.currentTarget.parentElement
            if (parent) parent.style.borderColor = "var(--oc-border-focus)"
          }}
          onBlur={(e) => {
            const parent = e.currentTarget.parentElement
            if (parent) parent.style.borderColor = "var(--oc-border-primary)"
          }}
        />

        <Show
          when={!props.isRunning}
          fallback={
            <Button variant="danger" size="sm" onClick={props.onAbort}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop
            </Button>
          }
        >
          <Button
            variant="primary"
            size="sm"
            disabled={!text().trim() || props.disabled}
            onClick={handleSubmit}
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send
          </Button>
        </Show>
      </div>

      {/* Bottom bar: model + char count */}
      <div
        style={{
          display: "flex",
          "align-items": "center",
          "justify-content": "space-between",
          "margin-top": "6px",
          padding: "0 4px",
        }}
      >
        <span
          style={{
            "font-size": "12px",
            color: "var(--oc-text-tertiary)",
            "font-family": "var(--oc-font-mono)",
          }}
        >
          {props.modelName || "No model selected"}
        </span>
        <span
          style={{
            "font-size": "12px",
            color: "var(--oc-text-tertiary)",
            "font-family": "var(--oc-font-mono)",
          }}
        >
          {text().length > 0 ? `${text().length} chars` : "Enter to send, Shift+Enter for newline"}
        </span>
      </div>
    </div>
  )
}
