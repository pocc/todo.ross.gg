import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal, onMount, onCleanup } from "solid-js"
import type { CommandItem } from "~/lib/types"

interface CommandContextState {
  commands: () => CommandItem[]
  open: () => boolean
  register: (item: CommandItem) => void
  unregister: (id: string) => void
  openPalette: () => void
  closePalette: () => void
  togglePalette: () => void
  search: (query: string) => CommandItem[]
}

const CommandContext = createContext<CommandContextState>()

const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

function parseShortcut(shortcut: string): { key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean } {
  const parts = shortcut.toLowerCase().split("+")
  let ctrl = false
  let shift = false
  let alt = false
  let meta = false
  let key = ""

  for (const part of parts) {
    switch (part) {
      case "mod":
        if (IS_MAC) meta = true
        else ctrl = true
        break
      case "ctrl":
        ctrl = true
        break
      case "shift":
        shift = true
        break
      case "alt":
        alt = true
        break
      case "meta":
      case "cmd":
        meta = true
        break
      default:
        key = part
        break
    }
  }

  return { key, ctrl, shift, alt, meta }
}

function matchesShortcut(
  event: KeyboardEvent,
  parsed: ReturnType<typeof parseShortcut>
): boolean {
  return (
    event.key.toLowerCase() === parsed.key &&
    event.ctrlKey === parsed.ctrl &&
    event.shiftKey === parsed.shift &&
    event.altKey === parsed.alt &&
    event.metaKey === parsed.meta
  )
}

export const CommandProvider: ParentComponent = (props) => {
  const [commands, setCommands] = createSignal<CommandItem[]>([])
  const [open, setOpen] = createSignal(false)

  function register(item: CommandItem) {
    setCommands((prev) => {
      const filtered = prev.filter((c) => c.id !== item.id)
      return [...filtered, item]
    })
  }

  function unregister(id: string) {
    setCommands((prev) => prev.filter((c) => c.id !== id))
  }

  function openPalette() {
    setOpen(true)
  }

  function closePalette() {
    setOpen(false)
  }

  function togglePalette() {
    setOpen((v) => !v)
  }

  function search(query: string): CommandItem[] {
    if (!query) return commands()
    const lower = query.toLowerCase()
    return commands().filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        (cmd.group && cmd.group.toLowerCase().includes(lower))
    )
  }

  const defaultShortcut = parseShortcut("mod+k")

  function handleKeyDown(event: KeyboardEvent) {
    if (matchesShortcut(event, defaultShortcut)) {
      event.preventDefault()
      togglePalette()
      return
    }

    for (const cmd of commands()) {
      if (cmd.shortcut) {
        const parsed = parseShortcut(cmd.shortcut)
        if (matchesShortcut(event, parsed)) {
          event.preventDefault()
          cmd.action()
          return
        }
      }
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown)
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown)
    })
  })

  const state: CommandContextState = {
    commands,
    open,
    register,
    unregister,
    openPalette: openPalette,
    closePalette: closePalette,
    togglePalette: togglePalette,
    search,
  }

  return (
    <CommandContext.Provider value={state}>
      {props.children}
    </CommandContext.Provider>
  )
}

export function useCommand(): CommandContextState {
  const ctx = useContext(CommandContext)
  if (!ctx) throw new Error("useCommand must be used within CommandProvider")
  return ctx
}
