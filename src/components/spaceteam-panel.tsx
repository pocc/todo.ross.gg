import { Component, createSignal, onMount, onCleanup, For } from "solid-js"

const CONTROL_NAMES = [
  "Gelatinous Darkbucket",
  "Pulsing Ribbontrellis",
  "Beeping Trapezoid",
  "Heliscissor Scanner",
  "Flexible Steamprobe",
  "Radiocortex",
  "Tachyon Adapter",
  "Hypnobellows",
  "Quantum Biscuit Array",
  "Spectral Flange Pipe",
  "Subspatial Muffin Drive",
  "Newtonian Photomist",
  "Turbo Encabulator",
  "Cosmic Porkchop Relay",
  "Magneto-Reluctance Coil",
  "Plasma Denogginizer",
]

const BUTTON_VERBS = [
  "CARAMELIZE", "QUELL", "HONK", "EULOGIZE", "TANGLE",
  "IGNITE", "BEFUDDLE", "WOBBLE", "SNORKEL", "DEFENESTRATE",
  "CALIBRATE", "VENT", "AGITATE", "EXCITE",
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const ActionButton: Component<{ name: string; verb: string }> = (props) => {
  const [flash, setFlash] = createSignal(false)

  function handleClick() {
    setFlash(true)
    setTimeout(() => setFlash(false), 150)
  }

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "flex-shrink": "0",
        gap: "4px",
      }}
    >
      <span
        style={{
          "font-size": "8px",
          color: "rgba(140, 180, 220, 0.45)",
          "letter-spacing": "0.5px",
          "text-transform": "uppercase",
          "text-align": "center",
          "line-height": "1.2",
          "max-width": "100px",
        }}
      >
        {props.name}
      </span>
      <button
        tabIndex={-1}
        onClick={handleClick}
        style={{
          padding: "4px 12px",
          background: flash()
            ? "hsl(0, 50%, 45%)"
            : "hsl(0, 45%, 30%)",
          color: flash() ? "#fff" : "rgba(220, 180, 180, 0.8)",
          border: "2px solid hsl(0, 30%, 22%)",
          "border-radius": "3px",
          "font-family": "var(--oc-font-mono)",
          "font-size": "10px",
          "font-weight": "700",
          "letter-spacing": "1px",
          cursor: "pointer",
          "text-transform": "uppercase",
          transition: "background 100ms, color 100ms",
          "box-shadow": "inset 0 -2px 0 hsl(0, 30%, 20%), 0 1px 3px rgba(0,0,0,0.4)",
          "min-width": "80px",
        }}
      >
        {props.verb}
      </button>
    </div>
  )
}

export const ToggleSwitch: Component<{ name: string }> = (props) => {
  const [on, setOn] = createSignal(Math.random() > 0.5)

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "flex-shrink": "0",
        gap: "4px",
      }}
    >
      <span
        style={{
          "font-size": "8px",
          color: "rgba(140, 180, 220, 0.45)",
          "letter-spacing": "0.5px",
          "text-transform": "uppercase",
          "text-align": "center",
          "line-height": "1.2",
          "max-width": "100px",
        }}
      >
        {props.name}
      </span>
      <button
        tabIndex={-1}
        onClick={() => setOn(!on())}
        style={{
          padding: "3px 8px",
          background: "#1a1f2e",
          border: "2px solid rgba(80, 120, 160, 0.3)",
          "border-radius": "3px",
          "font-family": "var(--oc-font-mono)",
          "font-size": "10px",
          "font-weight": "700",
          "letter-spacing": "1px",
          cursor: "pointer",
          color: on() ? "#4ade80" : "rgba(140, 160, 180, 0.4)",
          transition: "color 150ms",
          "min-width": "60px",
          "text-align": "center",
        }}
      >
        {on() ? "[ ON ]" : "[ OFF]"}
      </button>
    </div>
  )
}

export const NumberDial: Component<{ name: string }> = (props) => {
  const [value, setValue] = createSignal(Math.floor(Math.random() * 10))

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "flex-shrink": "0",
        gap: "4px",
      }}
    >
      <span
        style={{
          "font-size": "8px",
          color: "rgba(140, 180, 220, 0.45)",
          "letter-spacing": "0.5px",
          "text-transform": "uppercase",
          "text-align": "center",
          "line-height": "1.2",
          "max-width": "100px",
        }}
      >
        {props.name}
      </span>
      <div
        style={{
          display: "flex",
          "align-items": "center",
          gap: "0",
        }}
      >
        <button
          tabIndex={-1}
          onClick={() => setValue(Math.max(0, value() - 1))}
          style={{
            width: "22px",
            height: "22px",
            background: "#1a1f2e",
            border: "1px solid rgba(80, 120, 160, 0.3)",
            "border-radius": "2px 0 0 2px",
            color: "rgba(140, 180, 220, 0.6)",
            "font-family": "var(--oc-font-mono)",
            "font-size": "12px",
            cursor: "pointer",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
          }}
        >
          -
        </button>
        <div
          style={{
            width: "28px",
            height: "22px",
            background: "#0f1320",
            "border-top": "1px solid rgba(80, 120, 160, 0.3)",
            "border-bottom": "1px solid rgba(80, 120, 160, 0.3)",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            "font-family": "var(--oc-font-mono)",
            "font-size": "11px",
            "font-weight": "700",
            color: "#e0f0ff",
          }}
        >
          {value()}
        </div>
        <button
          tabIndex={-1}
          onClick={() => setValue(Math.min(9, value() + 1))}
          style={{
            width: "22px",
            height: "22px",
            background: "#1a1f2e",
            border: "1px solid rgba(80, 120, 160, 0.3)",
            "border-radius": "0 2px 2px 0",
            color: "rgba(140, 180, 220, 0.6)",
            "font-family": "var(--oc-font-mono)",
            "font-size": "12px",
            cursor: "pointer",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}

export const Slider: Component<{ name: string }> = (props) => {
  const [value, setValue] = createSignal(Math.floor(Math.random() * 10))

  onMount(() => {
    const iv = setInterval(() => {
      setValue((v) => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.max(0, Math.min(10, v + delta))
      })
    }, 2000 + Math.random() * 3000)
    onCleanup(() => clearInterval(iv))
  })

  const bar = () => {
    const filled = value()
    const empty = 10 - filled
    return "\u2588".repeat(filled) + "\u2591".repeat(empty)
  }

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "flex-shrink": "0",
        gap: "4px",
      }}
    >
      <span
        style={{
          "font-size": "8px",
          color: "rgba(140, 180, 220, 0.45)",
          "letter-spacing": "0.5px",
          "text-transform": "uppercase",
          "text-align": "center",
          "line-height": "1.2",
          "max-width": "100px",
        }}
      >
        {props.name}
      </span>
      <div
        style={{
          padding: "3px 6px",
          background: "#0f1320",
          border: "1px solid rgba(80, 120, 160, 0.25)",
          "border-radius": "2px",
          "font-family": "var(--oc-font-mono)",
          "font-size": "9px",
          color: "rgba(100, 200, 255, 0.6)",
          "letter-spacing": "0",
          "white-space": "nowrap",
        }}
      >
        {bar()} {value() * 10}%
      </div>
    </div>
  )
}

export const SpaceteamPanel: Component = () => {
  const [names] = createSignal(shuffle(CONTROL_NAMES))
  const [verbs] = createSignal(shuffle(BUTTON_VERBS))
  const [_blinkOn] = createSignal(true)

  const controls = () => {
    const n = names()
    const v = verbs()
    return [
      { type: "button" as const, name: n[0], verb: v[0] },
      { type: "toggle" as const, name: n[1] },
      { type: "slider" as const, name: n[2] },
      { type: "dial" as const, name: n[3] },
      { type: "button" as const, name: n[4], verb: v[1] },
    ]
  }

  return (
    <div
      aria-hidden="true"
      style={{
        "flex-shrink": "0",
        background: "linear-gradient(180deg, #0e1225 0%, #0a0d1a 100%)",
        "border-top": "1px solid rgba(80, 140, 200, 0.2)",
        "border-bottom": "1px solid rgba(80, 140, 200, 0.15)",
        position: "relative",
      }}
    >
      {/* Panel accent line */}
      <div
        style={{
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, rgba(60, 130, 200, 0.3) 20%, rgba(60, 130, 200, 0.5) 50%, rgba(60, 130, 200, 0.3) 80%, transparent 100%)",
        }}
      />

      {/* Panel header */}
      <div
        style={{
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          padding: "4px 12px 2px",
          gap: "8px",
        }}
      >
        <span
          style={{
            "font-family": "var(--oc-font-mono)",
            "font-size": "8px",
            color: "rgba(100, 150, 200, 0.3)",
            "letter-spacing": "2px",
            "text-transform": "uppercase",
          }}
        >
          {"=".repeat(12)} SPACETEAM COMMAND INTERFACE v4.20 {"=".repeat(12)}
        </span>
      </div>

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          "align-items": "flex-end",
          "justify-content": "space-around",
          padding: "6px 16px 8px",
          gap: "12px",
          "overflow-x": "auto",
          "min-height": "52px",
          "scrollbar-width": "none",
        }}
      >
        <For each={controls()}>
          {(ctrl) => {
            if (ctrl.type === "button") return <ActionButton name={ctrl.name} verb={ctrl.verb!} />
            if (ctrl.type === "toggle") return <ToggleSwitch name={ctrl.name} />
            if (ctrl.type === "dial") return <NumberDial name={ctrl.name} />
            return <Slider name={ctrl.name} />
          }}
        </For>
      </div>

      {/* Blinking warning */}
      <div
        style={{
          "text-align": "center",
          padding: "2px 0 8px",
        }}
      >
        <span
          style={{
            "font-family": "var(--oc-font-mono)",
            "font-size": "9px",
            "font-weight": "700",
            color: "rgba(250, 200, 50, 0.6)",
            "letter-spacing": "1px",
          }}
        >
          !! PORKCHOP LEVELS CRITICAL !!
        </span>
      </div>
    </div>
  )
}
