import { type Component, splitProps, createSignal, createEffect, onCleanup } from "solid-js"

export interface AnimatedNumberProps {
  value: number
  duration?: number
  class?: string
}

export const AnimatedNumber: Component<AnimatedNumberProps> = (props) => {
  const [local] = splitProps(props, ["value", "duration", "class"])
  const [display, setDisplay] = createSignal(local.value)
  let rafId: number | undefined

  createEffect(() => {
    const target = local.value
    const dur = local.duration ?? 500
    const start = display()
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / dur, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + diff * eased)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setDisplay(target)
      }
    }

    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(animate)
  })

  onCleanup(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })

  const formatted = () => {
    const v = display()
    return Number.isInteger(local.value) ? Math.round(v).toString() : v.toFixed(2)
  }

  return (
    <span class={local.class} style={{ "font-variant-numeric": "tabular-nums" }}>
      {formatted()}
    </span>
  )
}
