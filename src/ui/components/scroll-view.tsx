import { type JSX, type Component, splitProps, onMount, onCleanup } from "solid-js"

export interface ScrollViewProps {
  children?: JSX.Element
  class?: string
  horizontal?: boolean
  onScrollEnd?: () => void
}

export const ScrollView: Component<ScrollViewProps> = (props) => {
  const [local] = splitProps(props, ["children", "class", "horizontal", "onScrollEnd"])
  let ref: HTMLDivElement | undefined

  const handleScroll = () => {
    if (!ref || !local.onScrollEnd) return
    if (local.horizontal) {
      const nearEnd = ref.scrollLeft + ref.clientWidth >= ref.scrollWidth - 20
      if (nearEnd) local.onScrollEnd()
    } else {
      const nearEnd = ref.scrollTop + ref.clientHeight >= ref.scrollHeight - 20
      if (nearEnd) local.onScrollEnd()
    }
  }

  onMount(() => {
    ref?.addEventListener("scroll", handleScroll, { passive: true })
  })

  onCleanup(() => {
    ref?.removeEventListener("scroll", handleScroll)
  })

  return (
    <div
      ref={ref}
      class={local.class}
      style={{
        overflow: local.horizontal ? "auto hidden" : "hidden auto",
        "flex-direction": local.horizontal ? "row" : "column",
        "-webkit-overflow-scrolling": "touch",
        position: "relative",
        "min-height": "0",
        flex: "1",
      }}
    >
      {local.children}
    </div>
  )
}
