import { Component, Show, createEffect, createSignal, onMount, onCleanup } from "solid-js"
import { useParams, useNavigate } from "@solidjs/router"
import { SyncProvider, useSync } from "~/context/sync"
import { useServer } from "~/context/server"
import { useLayout } from "~/context/layout"
import { useGlobalSync } from "~/context/global-sync"
import { useTheme } from "~/ui/theme"
import { MessageTimeline } from "~/pages/session/message-timeline"
import { Composer } from "~/pages/session/composer"
import { ReviewPanel } from "~/pages/session/review-panel"
import { SessionHeader } from "~/pages/session/session-header"
import { SpaceViewport } from "~/components/space-viewport"
import { SpaceteamPanel, ActionButton, ToggleSwitch, NumberDial, Slider } from "~/components/spaceteam-panel"
import type { Session, MessagePart } from "~/lib/types"

const LOG_MESSAGES = [
  "Porkchop reserves at 34%... initiating rationing protocol",
  "Recalibrating flux wobbler... standby",
  "Warning: unauthorized snacks detected in cargo bay 7",
  "Graviton defibrilator output nominal",
  "Helmsman reports mild existential dread",
  "Muffin drive temperature within tolerance",
  "Quantum biscuit alignment verified",
  "Incoming hail from Sector 7G... ignoring",
  "Hull integrity check passed (barely)",
  "Auxiliary porkchops online",
  "Space-time continuum: mostly intact",
  "Turbo encabulator engaged at 73% capacity",
  "Cosmic ray diffuser needs recalibration by Tuesday",
  "Life support: functional (for now)",
  "Tachyon snorkel valve pressure holding steady",
  "Subspatial interference detected... it was just Dave",
  "Coffee reserves critical — crew morale declining",
  "Navigation: still lost, but making good time",
  "Photomist levels acceptable in sectors A through G",
  "Dark energy dimmer set to 'cozy'",
]

const ShipLog: Component = () => {
  const [lines, setLines] = createSignal<string[]>([])
  let msgIndex = 0

  const addLine = () => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
    const msg = LOG_MESSAGES[msgIndex % LOG_MESSAGES.length]
    msgIndex++
    setLines((prev) => [...prev.slice(-6), `${time} ${msg}`])
  }

  onMount(() => {
    addLine()
    addLine()
    addLine()
    const iv = setInterval(addLine, 4000 + Math.random() * 3000)
    onCleanup(() => clearInterval(iv))
  })

  return (
    <div
      style={{
        "font-family": "var(--oc-font-mono)",
        "font-size": "10px",
        color: "rgba(80, 200, 120, 0.55)",
        "line-height": "1.6",
        "white-space": "nowrap",
        overflow: "hidden",
      }}
    >
      {lines().map((line) => (
        <div style={{ "text-overflow": "ellipsis", overflow: "hidden" }}>{line}</div>
      ))}
    </div>
  )
}

const SendButton: Component<{
  hasText: boolean
  sending: boolean
  onSend: () => void
  dark: boolean
}> = (props) => (
  <button
    onClick={props.onSend}
    disabled={!props.hasText || props.sending}
    style={{
      padding: "5px 16px",
      background: props.hasText
        ? props.dark
          ? "linear-gradient(180deg, rgba(50, 130, 220, 0.8) 0%, rgba(40, 100, 180, 0.8) 100%)"
          : "var(--oc-accent-primary)"
        : props.dark ? "rgba(50, 80, 120, 0.25)" : "var(--oc-bg-tertiary)",
      color: props.hasText
        ? props.dark ? "var(--oc-cockpit-highlight)" : "#fff"
        : props.dark ? "rgba(100, 150, 200, 0.5)" : "var(--oc-text-disabled)",
      border: props.hasText
        ? props.dark ? "1px solid rgba(80, 160, 255, 0.3)" : "1px solid var(--oc-accent-primary)"
        : props.dark ? "1px solid rgba(60, 100, 160, 0.25)" : "1px solid var(--oc-border-primary)",
      "border-radius": props.dark ? "4px" : "8px",
      "font-size": "11px",
      "font-weight": "600",
      "font-family": props.dark ? "var(--oc-font-mono)" : "var(--oc-font-sans)",
      "letter-spacing": props.dark ? "1.5px" : "0.5px",
      "text-transform": props.dark ? "uppercase" : "none",
      cursor: props.hasText ? "pointer" : "default",
      transition: "all 150ms ease",
      display: "flex",
      "align-items": "center",
      gap: "6px",
      "box-shadow": props.hasText && props.dark ? "0 0 12px rgba(50, 130, 220, 0.2)" : "none",
    }}
  >
    {props.sending ? (
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
    {props.dark ? "Transmit" : "Send"}
  </button>
)

const EmptySession: Component = () => {
  const params = useParams<{ dir: string }>()
  const navigate = useNavigate()
  const server = useServer()
  const theme = useTheme()
  const [text, setText] = createSignal("")
  const [sending, setSending] = createSignal(false)
  const [focused, setFocused] = createSignal(false)
  const directory = () => {
    try { return atob(params.dir) } catch { return "" }
  }

  const isDark = () => theme.resolvedMode() === "dark"

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
    <Show when={isDark()} fallback={
      /* ===== LIGHT MODE: Clean centered interface ===== */
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          background: "var(--oc-bg-primary)",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            "max-width": "600px",
          }}
        >
          <h2
            style={{
              "font-size": "20px",
              "font-weight": "500",
              color: "var(--oc-text-primary)",
              "margin-bottom": "16px",
              "font-family": "var(--oc-font-sans)",
            }}
          >
            What would you like to work on?
          </h2>
          <div
            style={{
              background: "var(--oc-bg-primary)",
              border: focused()
                ? "1px solid var(--oc-border-focus)"
                : "1px solid var(--oc-border-primary)",
              "border-radius": "12px",
              overflow: "hidden",
              "box-shadow": focused()
                ? "0 0 0 3px rgba(91, 91, 230, 0.1)"
                : "0 1px 3px rgba(0,0,0,0.05)",
              transition: "border-color 200ms ease, box-shadow 200ms ease",
            }}
          >
            <textarea
              value={text()}
              onInput={(e) => setText(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Describe a task, ask a question, or paste code..."
              aria-label="Message input"
              disabled={sending()}
              rows={3}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "transparent",
                border: "none",
                color: "var(--oc-text-primary)",
                "font-size": "14px",
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
                "border-top": "1px solid var(--oc-border-primary)",
              }}
            >
              <span
                style={{
                  "font-size": "12px",
                  color: "var(--oc-text-tertiary)",
                }}
              >
                Enter to send, Shift+Enter for newline
              </span>
              <SendButton hasText={!!text().trim()} sending={sending()} onSend={handleSend} dark={false} />
            </div>
          </div>
        </div>
      </div>
    }>
      {/* ===== DARK MODE: Cockpit interface ===== */}
      <div
        style={{
          width: "100%",
          height: "100%",
          "overflow-y": "auto",
          "overflow-x": "hidden",
          background: "var(--oc-cockpit-bg)",
          display: "flex",
          "flex-direction": "column",
          "scrollbar-width": "thin",
        }}
      >
        {/* Viewport — ISS feed, top portion */}
        <div
          class="cockpit-viewport"
          style={{
            position: "relative",
            flex: "0 0 35%",
            "min-height": "160px",
            overflow: "hidden",
            padding: "0 16px",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", "max-width": "900px", margin: "0 auto", overflow: "hidden", "border-radius": "0 0 4px 4px" }}>
            <SpaceViewport />
          </div>
        </div>

        {/* Control panel — textbox surrounded by controls */}
        <div
          style={{
            flex: "1 0 auto",
            background: `linear-gradient(180deg, var(--oc-cockpit-panel) 0%, var(--oc-cockpit-panel-end) 100%)`,
            padding: "0 16px 12px",
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
          }}
        >
          {/* COMMS TERMINAL label */}
          <div
            style={{
              display: "flex",
              "align-items": "center",
              "justify-content": "space-between",
              width: "100%",
              "max-width": "900px",
              padding: "0 4px 6px",
            }}
          >
            <div style={{ display: "flex", "align-items": "center", gap: "16px" }}>
              {[
                { label: "COMM", color: "var(--oc-cockpit-green)" },
                { label: "NAV", color: "var(--oc-cockpit-green)" },
                { label: "SHIELD", color: "var(--oc-cockpit-yellow)" },
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
                      "font-size": "10px",
                      color: "var(--oc-cockpit-text)",
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
                "font-size": "10px",
                color: "var(--oc-cockpit-text-muted)",
                "letter-spacing": "1px",
              }}
            >
              COMMS TERMINAL
            </span>
          </div>

          {/* Grid: left controls | textbox | right controls */}
          <div
            class="cockpit-grid"
            style={{
              display: "grid",
              "grid-template-columns": "minmax(100px, 1fr) minmax(280px, 3fr) minmax(100px, 1fr)",
              gap: "16px",
              width: "100%",
              "max-width": "900px",
              "align-items": "center",
            }}
          >
            {/* Left controls */}
            <div
              class="cockpit-side-controls"
              aria-hidden="true"
              style={{
                display: "flex",
                "flex-direction": "column",
                "align-items": "center",
                gap: "12px",
              }}
            >
              <ActionButton name="Turbo Encabulator" verb="HONK" />
              <ToggleSwitch name="Flux Wobbler" />
              <NumberDial name="Hypnobellows" />
            </div>

            {/* Center textbox — hero element */}
            <div
              style={{
                background: "rgba(8, 12, 25, 0.95)",
                border: focused()
                  ? "1px solid var(--oc-cockpit-border-bright)"
                  : "1px solid var(--oc-cockpit-border)",
                "border-radius": "10px",
                overflow: "hidden",
                "box-shadow": focused()
                  ? "0 0 40px rgba(60, 140, 220, 0.25), inset 0 1px 0 rgba(80, 140, 200, 0.15), 0 0 0 1px rgba(80, 160, 255, 0.1)"
                  : "0 0 20px rgba(60, 140, 220, 0.1), inset 0 1px 0 rgba(80, 140, 200, 0.08)",
                transition: "border-color 200ms ease, box-shadow 200ms ease",
                position: "relative",
                "z-index": "1",
              }}
            >
              <textarea
                value={text()}
                onInput={(e) => setText(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter command..."
                aria-label="Enter command"
                disabled={sending()}
                rows={3}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "transparent",
                  border: "none",
                  color: "var(--oc-cockpit-input-text)",
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
                  padding: "5px 12px",
                  "border-top": `1px solid var(--oc-cockpit-border-faint)`,
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    "font-size": "10px",
                    "font-family": "var(--oc-font-mono)",
                    color: "var(--oc-cockpit-text-faint)",
                    "letter-spacing": "0.5px",
                    "white-space": "nowrap",
                    overflow: "hidden",
                    "text-overflow": "ellipsis",
                    "min-width": "0",
                  }}
                >
                  ENTER transmit &middot; SHIFT+ENTER newline
                </span>
                <SendButton hasText={!!text().trim()} sending={sending()} onSend={handleSend} dark={true} />
              </div>
            </div>

            {/* Right controls */}
            <div
              class="cockpit-side-controls"
              aria-hidden="true"
              style={{
                display: "flex",
                "flex-direction": "column",
                "align-items": "center",
                gap: "12px",
              }}
            >
              <Slider name="Radiocortex" />
              <ActionButton name="Beeping Trapezoid" verb="EULOGIZE" />
              <ToggleSwitch name="Tachyon Adapter" />
            </div>
          </div>

          {/* Bottom controls strip */}
          <div style={{ width: "100%", "max-width": "900px", "margin-top": "8px" }}>
            <SpaceteamPanel />
          </div>

          {/* Dashboard instruments + Ship's log */}
          <div
            class="cockpit-instruments"
            style={{
              width: "100%",
              "max-width": "900px",
              "margin-top": "8px",
              display: "grid",
              "grid-template-columns": "1fr 1fr 1fr",
              gap: "8px",
            }}
            aria-hidden="true"
          >
            {/* Left — Radar screen */}
            <div
              style={{
                background: "var(--oc-cockpit-surface)",
                border: `1px solid var(--oc-cockpit-border-muted)`,
                "border-radius": "6px",
                padding: "6px",
                "min-height": "90px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                "font-family": "var(--oc-font-mono)",
                "font-size": "10px",
                color: "rgba(40, 180, 255, 0.4)",
                "letter-spacing": "1.5px",
                "text-transform": "uppercase",
                "margin-bottom": "4px",
              }}>NAV SYSTEM</div>
              <svg viewBox="0 0 100 70" style={{ width: "100%", height: "auto" }}>
                <circle cx="50" cy="38" r="28" fill="none" stroke="rgba(40, 180, 255, 0.12)" stroke-width="0.8" />
                <circle cx="50" cy="38" r="14" fill="none" stroke="rgba(40, 180, 255, 0.08)" stroke-width="0.5" />
                <line x1="22" y1="38" x2="78" y2="38" stroke="rgba(40, 180, 255, 0.08)" stroke-width="0.5" />
                <line x1="50" y1="10" x2="50" y2="66" stroke="rgba(40, 180, 255, 0.08)" stroke-width="0.5" />
                <circle cx="62" cy="30" r="2.5" fill="rgba(40, 200, 255, 0.5)" />
                <circle cx="38" cy="48" r="1.8" fill="rgba(40, 200, 255, 0.3)" />
                <circle cx="55" cy="52" r="1.5" fill="rgba(255, 200, 40, 0.4)" />
              </svg>
            </div>

            {/* Center — Ship's log terminal */}
            <div
              style={{
                background: "var(--oc-cockpit-surface)",
                border: `1px solid var(--oc-cockpit-border-muted)`,
                "border-radius": "6px",
                padding: "6px",
                "min-height": "90px",
                overflow: "hidden",
              }}
            >
              <div style={{
                "font-family": "var(--oc-font-mono)",
                "font-size": "10px",
                color: "rgba(40, 180, 255, 0.4)",
                "letter-spacing": "1.5px",
                "text-transform": "uppercase",
                "margin-bottom": "4px",
              }}>SHIP LOG</div>
              <ShipLog />
            </div>

            {/* Right — Gauges + red buttons */}
            <div
              style={{
                background: "var(--oc-cockpit-surface)",
                border: `1px solid var(--oc-cockpit-border-muted)`,
                "border-radius": "6px",
                padding: "6px",
                "min-height": "90px",
                overflow: "hidden",
              }}
            >
              <div style={{
                "font-family": "var(--oc-font-mono)",
                "font-size": "10px",
                color: "rgba(40, 180, 255, 0.4)",
                "letter-spacing": "1.5px",
                "text-transform": "uppercase",
                "margin-bottom": "4px",
              }}>AUX CONTROL</div>
              <svg viewBox="0 0 100 70" style={{ width: "100%", height: "auto" }}>
                <circle cx="25" cy="22" r="12" fill="none" stroke="rgba(80, 140, 200, 0.2)" stroke-width="0.8" />
                <circle cx="25" cy="22" r="3" fill="rgba(80, 160, 220, 0.1)" />
                <line x1="25" y1="22" x2="33" y2="16" stroke="rgba(200, 100, 100, 0.4)" stroke-width="0.8" />
                <circle cx="75" cy="22" r="12" fill="none" stroke="rgba(80, 140, 200, 0.2)" stroke-width="0.8" />
                <circle cx="75" cy="22" r="3" fill="rgba(80, 160, 220, 0.1)" />
                <line x1="75" y1="22" x2="68" y2="14" stroke="rgba(200, 100, 100, 0.4)" stroke-width="0.8" />
                {[0,1,2,3].map((i) =>
                  [0,1].map((j) => (
                    <rect
                      x={15 + i * 20}
                      y={45 + j * 14}
                      width="14"
                      height="9"
                      rx="1.5"
                      fill={`rgba(200, 50, 50, ${0.2 + ((i + j) % 3) * 0.08})`}
                      stroke="rgba(200, 50, 50, 0.15)"
                      stroke-width="0.5"
                    />
                  ))
                )}
              </svg>
            </div>
          </div>

          {/* Extra controls row */}
          <div
            class="cockpit-extra-controls"
            style={{
              width: "100%",
              "max-width": "900px",
              "margin-top": "8px",
              display: "flex",
              "align-items": "flex-end",
              "justify-content": "space-around",
              gap: "12px",
              padding: "4px 0",
            }}
            aria-hidden="true"
          >
            <ActionButton name="Anti-Matter Toaster" verb="DEFENESTRATE" />
            <Slider name="Warp Whistle Array" />
            <ToggleSwitch name="Dark Energy Dimmer" />
            <NumberDial name="Proton Sandwich Press" />
            <ActionButton name="Subspatial Muffin Drive" verb="SNORKEL" />
          </div>
        </div>
      </div>
    </Show>
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
          onModelSelect={async (provider, model) => {
            try {
              await server.sdk.updateSession(params.id, { model: { provider, model } } as Partial<Session>)
              globalSync.refreshSessions()
            } catch {
              // model update failed
            }
          }}
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
