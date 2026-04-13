import { type Component, splitProps, Switch, Match } from "solid-js"
import { Spinner } from "./spinner"

export interface ToolStatusTitleProps {
  toolName: string
  state: string
}

export const ToolStatusTitle: Component<ToolStatusTitleProps> = (props) => {
  const [local] = splitProps(props, ["toolName", "state"])

  return (
    <span style={{ display: "inline-flex", "align-items": "center", gap: "6px", "font-size": "13px" }}>
      <Switch>
        <Match when={local.state === "running" || local.state === "pending"}>
          <Spinner size="sm" />
        </Match>
        <Match when={local.state === "completed"}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 7L6 9.5L10.5 4.5" stroke="var(--oc-success)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </Match>
        <Match when={local.state === "error"}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 4L10 10M10 4L4 10" stroke="var(--oc-error)" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </Match>
      </Switch>
      <span style={{ "font-weight": "500", color: "var(--oc-text-primary)", "font-family": "var(--oc-font-mono)", "font-size": "12px" }}>
        {local.toolName}
      </span>
    </span>
  )
}
