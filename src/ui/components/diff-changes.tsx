import { type Component, splitProps, For } from "solid-js"
import { Show } from "solid-js"

export interface DiffChangesProps {
  additions: number
  deletions: number
  mode?: "text" | "bar"
}

export const DiffChanges: Component<DiffChangesProps> = (props) => {
  const [local] = splitProps(props, ["additions", "deletions", "mode"])
  const m = () => local.mode ?? "text"

  return (
    <Show
      when={m() === "text"}
      fallback={<DiffBar additions={local.additions} deletions={local.deletions} />}
    >
      <span style={{ display: "inline-flex", gap: "6px", "font-size": "12px", "font-family": "var(--oc-font-mono)" }}>
        <Show when={local.additions > 0}>
          <span style={{ color: "var(--oc-diff-add-text)" }}>+{local.additions}</span>
        </Show>
        <Show when={local.deletions > 0}>
          <span style={{ color: "var(--oc-diff-del-text)" }}>-{local.deletions}</span>
        </Show>
        <Show when={local.additions === 0 && local.deletions === 0}>
          <span style={{ color: "var(--oc-text-tertiary)" }}>0</span>
        </Show>
      </span>
    </Show>
  )
}

const DiffBar: Component<{ additions: number; deletions: number }> = (props) => {
  const total = () => props.additions + props.deletions
  const squares = 5

  const getColors = (): string[] => {
    if (total() === 0) return Array(squares).fill("var(--oc-surface-tertiary)")
    const addCount = total() > 0 ? Math.round((props.additions / total()) * squares) : 0
    const delCount = squares - addCount
    const result: string[] = []
    for (let i = 0; i < addCount; i++) result.push("var(--oc-diff-add-text)")
    for (let i = 0; i < delCount; i++) result.push("var(--oc-diff-del-text)")
    return result
  }

  return (
    <span style={{ display: "inline-flex", gap: "2px", "align-items": "center" }}>
      <For each={getColors()}>
        {(color) => (
          <span
            style={{
              width: "8px",
              height: "8px",
              "border-radius": "1px",
              background: color,
            }}
          />
        )}
      </For>
    </span>
  )
}
