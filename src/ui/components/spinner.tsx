import { type Component } from "solid-js"

export interface SpinnerProps {
  size?: "sm" | "md" | "lg"
}

const sizeMap = { sm: 14, md: 20, lg: 28 }

export const Spinner: Component<SpinnerProps> = (props) => {
  const s = () => sizeMap[props.size ?? "md"]

  return (
    <svg
      width={s()}
      height={s()}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: "oc-spin 0.8s linear infinite",
        "flex-shrink": "0",
      }}
    >
      <style>{`@keyframes oc-spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
  )
}
