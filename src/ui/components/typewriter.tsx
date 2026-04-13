import { type Component, splitProps, createSignal, createEffect, onCleanup } from "solid-js"

export interface TypewriterProps {
  text: string
  speed?: number
  class?: string
}

export const Typewriter: Component<TypewriterProps> = (props) => {
  const [local] = splitProps(props, ["text", "speed", "class"])
  const [displayed, setDisplayed] = createSignal("")
  let interval: ReturnType<typeof setInterval> | undefined

  createEffect(() => {
    const target = local.text
    const spd = local.speed ?? 40
    let index = 0
    setDisplayed("")

    if (interval) clearInterval(interval)

    interval = setInterval(() => {
      if (index < target.length) {
        setDisplayed(target.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        interval = undefined
      }
    }, spd)
  })

  onCleanup(() => {
    if (interval) clearInterval(interval)
  })

  return (
    <span class={local.class} style={{ "white-space": "pre-wrap" }}>
      {displayed()}
      <span
        style={{
          display: "inline-block",
          width: "2px",
          height: "1em",
          background: "var(--oc-accent-primary)",
          "margin-left": "1px",
          "vertical-align": "text-bottom",
          animation: "oc-blink 0.8s step-end infinite",
        }}
      />
      <style>{`@keyframes oc-blink { 50% { opacity: 0; } }`}</style>
    </span>
  )
}
