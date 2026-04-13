import { type Component, splitProps } from "solid-js"

export interface ProgressProps {
  value: number
  class?: string
}

export const Progress: Component<ProgressProps> = (props) => {
  const [local] = splitProps(props, ["value", "class"])
  const clamped = () => Math.max(0, Math.min(100, local.value))

  return (
    <div
      class={local.class}
      role="progressbar"
      aria-valuenow={clamped()}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: "100%",
        height: "4px",
        background: "var(--oc-surface-tertiary)",
        "border-radius": "2px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${clamped()}%`,
          height: "100%",
          background: "var(--oc-accent-primary)",
          "border-radius": "2px",
          transition: "width 300ms ease",
        }}
      />
    </div>
  )
}
