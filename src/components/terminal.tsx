import { type Component, createSignal, createEffect, onMount, onCleanup, Show } from "solid-js"
import { useServer } from "~/context/server"

export interface TerminalProps {
  ptyId: string
  directory: string
}

const MAX_RECONNECT_ATTEMPTS = 5
const BACKOFF_MS = [250, 500, 1000, 2000, 4000]

export const Terminal: Component<TerminalProps> = (props) => {
  const server = useServer()

  const [output, setOutput] = createSignal("")
  const [status, setStatus] = createSignal<"connecting" | "connected" | "disconnected" | "error">("connecting")
  const [errorMsg, setErrorMsg] = createSignal("")

  let ws: WebSocket | null = null
  let reconnectAttempts = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  let preRef: HTMLPreElement | undefined
  let containerRef: HTMLDivElement | undefined

  function scrollToBottom() {
    if (preRef) {
      preRef.scrollTop = preRef.scrollHeight
    }
  }

  function connect() {
    if (ws) {
      ws.onclose = null
      ws.onerror = null
      ws.onmessage = null
      ws.close()
    }

    setStatus("connecting")
    const url = server.sdk.connectPtyUrl(props.ptyId)
    ws = new WebSocket(url)
    ws.binaryType = "arraybuffer"

    ws.onopen = () => {
      setStatus("connected")
      setErrorMsg("")
      reconnectAttempts = 0
    }

    ws.onmessage = (event) => {
      let text: string
      if (event.data instanceof ArrayBuffer) {
        text = new TextDecoder().decode(event.data)
      } else {
        text = event.data as string
      }
      setOutput((prev) => prev + text)
      requestAnimationFrame(scrollToBottom)
    }

    ws.onerror = () => {
      setStatus("error")
      setErrorMsg("WebSocket error")
    }

    ws.onclose = (event) => {
      if (status() !== "error") {
        setStatus("disconnected")
      }
      attemptReconnect()
    }
  }

  function attemptReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setStatus("error")
      setErrorMsg(`Failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} attempts`)
      return
    }
    const delay = BACKOFF_MS[reconnectAttempts] ?? BACKOFF_MS[BACKOFF_MS.length - 1]
    reconnectAttempts++
    reconnectTimer = setTimeout(() => {
      connect()
    }, delay)
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    event.preventDefault()
    event.stopPropagation()

    let data = ""

    if (event.key === "Enter") {
      data = "\r"
    } else if (event.key === "Backspace") {
      data = "\x7f"
    } else if (event.key === "Tab") {
      data = "\t"
    } else if (event.key === "Escape") {
      data = "\x1b"
    } else if (event.key === "ArrowUp") {
      data = "\x1b[A"
    } else if (event.key === "ArrowDown") {
      data = "\x1b[B"
    } else if (event.key === "ArrowRight") {
      data = "\x1b[C"
    } else if (event.key === "ArrowLeft") {
      data = "\x1b[D"
    } else if (event.key === "Home") {
      data = "\x1b[H"
    } else if (event.key === "End") {
      data = "\x1b[F"
    } else if (event.key === "Delete") {
      data = "\x1b[3~"
    } else if (event.ctrlKey && event.key.length === 1) {
      const code = event.key.toLowerCase().charCodeAt(0) - 96
      if (code > 0 && code < 27) {
        data = String.fromCharCode(code)
      }
    } else if (event.key.length === 1) {
      data = event.key
    }

    if (data) {
      ws.send(data)
    }
  }

  function handlePaste(event: ClipboardEvent) {
    event.preventDefault()
    const text = event.clipboardData?.getData("text")
    if (text && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(text)
    }
  }

  onMount(() => {
    connect()
  })

  onCleanup(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (ws) {
      ws.onclose = null
      ws.onerror = null
      ws.onmessage = null
      ws.close()
    }
  })

  const statusColor = () => {
    switch (status()) {
      case "connected": return "var(--oc-success)"
      case "connecting": return "var(--oc-warning)"
      case "disconnected": return "var(--oc-text-tertiary)"
      case "error": return "var(--oc-error)"
    }
  }

  const statusLabel = () => {
    switch (status()) {
      case "connected": return "Connected"
      case "connecting": return "Connecting..."
      case "disconnected": return "Disconnected"
      case "error": return errorMsg() || "Error"
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        "flex-direction": "column",
        height: "100%",
        background: "var(--oc-bg-primary)",
        "border-radius": "var(--oc-radius-md)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          "align-items": "center",
          gap: "8px",
          padding: "4px 10px",
          "font-size": "11px",
          color: "var(--oc-text-tertiary)",
          background: "var(--oc-surface-secondary)",
          "border-bottom": "1px solid var(--oc-border-primary)",
          "flex-shrink": "0",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            "border-radius": "50%",
            background: statusColor(),
            "flex-shrink": "0",
          }}
        />
        <span>{statusLabel()}</span>
        <span style={{ "margin-left": "auto", "font-family": "var(--oc-font-mono)", opacity: "0.7" }}>
          {props.directory}
        </span>
      </div>
      <pre
        ref={preRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{
          flex: "1",
          margin: "0",
          padding: "8px 10px",
          "font-family": "var(--oc-font-mono)",
          "font-size": "13px",
          "line-height": "1.5",
          color: "var(--oc-text-primary)",
          background: "var(--oc-bg-primary)",
          overflow: "auto",
          "white-space": "pre-wrap",
          "word-break": "break-all",
          outline: "none",
          cursor: "text",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 0 0 1px var(--oc-border-focus)"
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "none"
        }}
      >
        {output()}
        <Show when={status() === "connected"}>
          <span
            style={{
              display: "inline-block",
              width: "7px",
              height: "14px",
              background: "var(--oc-text-primary)",
              animation: "oc-cursor-blink 1s step-end infinite",
              "vertical-align": "text-bottom",
            }}
          />
        </Show>
      </pre>
      <style>{`
        @keyframes oc-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
