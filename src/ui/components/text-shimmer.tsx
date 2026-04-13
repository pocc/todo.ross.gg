import { type JSX, type Component, splitProps } from "solid-js"

export interface TextShimmerProps {
  children?: JSX.Element
  class?: string
}

export const TextShimmer: Component<TextShimmerProps> = (props) => {
  const [local] = splitProps(props, ["children", "class"])

  return (
    <span
      class={local.class}
      style={{
        display: "inline-block",
        background: "linear-gradient(90deg, var(--oc-text-primary) 0%, var(--oc-accent-primary) 50%, var(--oc-text-primary) 100%)",
        "background-size": "200% auto",
        "-webkit-background-clip": "text",
        "background-clip": "text",
        "-webkit-text-fill-color": "transparent",
        animation: "oc-shimmer 2s linear infinite",
      }}
    >
      <style>{`@keyframes oc-shimmer { to { background-position: -200% center; } }`}</style>
      {local.children}
    </span>
  )
}
