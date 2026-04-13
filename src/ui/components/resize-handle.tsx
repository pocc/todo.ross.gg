import { type Component, createSignal, onCleanup } from "solid-js"

export interface ResizeHandleProps {
  direction: "horizontal" | "vertical"
  onResize: (delta: number) => void
  min?: number
  max?: number
}

export const ResizeHandle: Component<ResizeHandleProps> = (props) => {
  const [dragging, setDragging] = createSignal(false)
  const [hovered, setHovered] = createSignal(false)
  let startPos = 0

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    startPos = props.direction === "horizontal" ? e.clientX : e.clientY

    const onMouseMove = (ev: MouseEvent) => {
      const current = props.direction === "horizontal" ? ev.clientX : ev.clientY
      let delta = current - startPos
      if (props.min !== undefined && delta < props.min) delta = props.min
      if (props.max !== undefined && delta > props.max) delta = props.max
      props.onResize(delta)
      startPos = current
    }

    const onMouseUp = () => {
      setDragging(false)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    document.body.style.cursor = props.direction === "horizontal" ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"
  }

  onCleanup(() => {
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  })

  const isHoriz = () => props.direction === "horizontal"
  const active = () => dragging() || hovered()

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: isHoriz() ? "6px" : "100%",
        height: isHoriz() ? "100%" : "6px",
        cursor: isHoriz() ? "col-resize" : "row-resize",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        "flex-shrink": "0",
        "z-index": "10",
        position: "relative",
      }}
    >
      <div
        style={{
          width: isHoriz() ? "2px" : "100%",
          height: isHoriz() ? "100%" : "2px",
          background: active() ? "var(--oc-accent-primary)" : "var(--oc-border-primary)",
          "border-radius": "1px",
          transition: "background 150ms ease",
        }}
      />
    </div>
  )
}
