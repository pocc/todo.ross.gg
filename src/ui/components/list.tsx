import { type JSX, type Component, splitProps, For, createSignal, createEffect, onMount, onCleanup } from "solid-js"

export interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number, active: boolean) => JSX.Element
  onSelect?: (item: T, index: number) => void
  activeIndex?: number
  class?: string
}

export function List<T>(props: ListProps<T>): JSX.Element {
  const [focusedIndex, setFocusedIndex] = createSignal(props.activeIndex ?? -1)
  let containerRef: HTMLDivElement | undefined

  createEffect(() => {
    if (props.activeIndex !== undefined) {
      setFocusedIndex(props.activeIndex)
    }
  })

  const handleKeyDown = (e: KeyboardEvent) => {
    const len = props.items.length
    if (len === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex((prev) => (prev + 1) % len)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex((prev) => (prev - 1 + len) % len)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const idx = focusedIndex()
      if (idx >= 0 && idx < len) {
        props.onSelect?.(props.items[idx], idx)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      class={props.class}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="listbox"
      style={{
        outline: "none",
        display: "flex",
        "flex-direction": "column",
      }}
    >
      <For each={props.items}>
        {(item, i) => (
          <div
            role="option"
            aria-selected={focusedIndex() === i()}
            onClick={() => {
              setFocusedIndex(i())
              props.onSelect?.(item, i())
            }}
            style={{ cursor: "pointer" }}
          >
            {props.renderItem(item, i(), focusedIndex() === i())}
          </div>
        )}
      </For>
    </div>
  )
}
