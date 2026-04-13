import { type Component, splitProps, Show, createSignal } from "solid-js"

export interface AvatarProps {
  name?: string
  src?: string
  size?: "sm" | "md" | "lg"
  fallback?: string
  class?: string
}

const sizePx = { sm: 24, md: 32, lg: 40 }
const fontSz = { sm: "10px", md: "12px", lg: "14px" }

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 50%, 40%)`
}

export const Avatar: Component<AvatarProps> = (props) => {
  const [local] = splitProps(props, ["name", "src", "size", "fallback", "class"])
  const [imgError, setImgError] = createSignal(false)
  const s = () => sizePx[local.size ?? "md"]
  const fs = () => fontSz[local.size ?? "md"]
  const initials = () => local.fallback ?? (local.name ? getInitials(local.name) : "?")
  const showImage = () => local.src && !imgError()

  return (
    <div
      class={local.class}
      style={{
        width: `${s()}px`,
        height: `${s()}px`,
        "border-radius": "50%",
        overflow: "hidden",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        background: showImage() ? "var(--oc-surface-secondary)" : stringToColor(local.name ?? ""),
        color: "#ffffff",
        "font-size": fs(),
        "font-weight": "600",
        "font-family": "var(--oc-font-sans)",
        "flex-shrink": "0",
        "user-select": "none",
      }}
    >
      <Show
        when={showImage()}
        fallback={<span>{initials()}</span>}
      >
        <img
          src={local.src}
          alt={local.name ?? "avatar"}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            "object-fit": "cover",
          }}
        />
      </Show>
    </div>
  )
}
