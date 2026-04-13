import { type Component, splitProps, Show } from "solid-js"

export interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  class?: string
}

const sizePx = { sm: 20, md: 28, lg: 36 }
const textSz = { sm: "13px", md: "16px", lg: "20px" }

export const Logo: Component<LogoProps> = (props) => {
  const [local] = splitProps(props, ["size", "showText", "class"])
  const s = () => sizePx[local.size ?? "md"]
  const ts = () => textSz[local.size ?? "md"]

  return (
    <span
      class={local.class}
      style={{
        display: "inline-flex",
        "align-items": "center",
        gap: "8px",
        "user-select": "none",
      }}
    >
      <svg
        width={s()}
        height={s()}
        viewBox="0 0 24 24"
        fill="none"
        style={{ "flex-shrink": "0" }}
      >
        <rect x="2" y="3" width="20" height="18" rx="3" stroke="var(--oc-accent-primary)" stroke-width="1.8" />
        <path d="M6 9l3 3-3 3" stroke="var(--oc-accent-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        <line x1="12" y1="15" x2="17" y2="15" stroke="var(--oc-accent-primary)" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <Show when={local.showText !== false}>
        <span
          style={{
            "font-size": ts(),
            "font-weight": "600",
            color: "var(--oc-text-primary)",
            "font-family": "var(--oc-font-sans)",
            "letter-spacing": "-0.02em",
          }}
        >
          OpenCode{" "}
          <span style={{ color: "var(--oc-accent-primary)", "font-weight": "400" }}>Web</span>
        </span>
      </Show>
    </span>
  )
}
