import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal } from "solid-js"
import { createStore, produce, reconcile } from "solid-js/store"
import { useServer } from "~/context/server"
import type { PtySession } from "~/lib/types"

interface TerminalContextState {
  sessions: PtySession[]
  activeTerminal: () => string | null
  create: (directory?: string) => Promise<PtySession | null>
  close: (id: string) => Promise<void>
  clone: (id: string) => Promise<PtySession | null>
  setActive: (id: string) => void
  refresh: () => Promise<void>
}

const TerminalContext = createContext<TerminalContextState>()

export const TerminalProvider: ParentComponent = (props) => {
  const server = useServer()

  const [sessions, setSessions] = createStore<PtySession[]>([])
  const [activeTerminal, setActiveTerminal] = createSignal<string | null>(null)

  async function refresh() {
    try {
      const result = await server.sdk.listPty()
      setSessions(reconcile(result.sessions))
    } catch {
      // refresh failed
    }
  }

  async function create(directory?: string): Promise<PtySession | null> {
    try {
      const session = await server.sdk.createPty({ directory })
      setSessions(produce((arr) => {
        arr.push(session)
      }))
      setActiveTerminal(session.id)
      return session
    } catch {
      return null
    }
  }

  async function close(id: string) {
    try {
      await server.sdk.deletePty(id)
      setSessions(produce((arr) => {
        const idx = arr.findIndex((s) => s.id === id)
        if (idx !== -1) arr.splice(idx, 1)
      }))
      if (activeTerminal() === id) {
        const remaining = sessions.filter((s) => s.id !== id)
        setActiveTerminal(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch {
      // close failed
    }
  }

  async function clone(id: string): Promise<PtySession | null> {
    const original = sessions.find((s) => s.id === id)
    if (!original) return null
    return create(original.directory)
  }

  function setActive(id: string) {
    setActiveTerminal(id)
  }

  const state: TerminalContextState = {
    get sessions() {
      return sessions
    },
    activeTerminal,
    create,
    close,
    clone,
    setActive,
    refresh,
  }

  return (
    <TerminalContext.Provider value={state}>
      {props.children}
    </TerminalContext.Provider>
  )
}

export function useTerminal(): TerminalContextState {
  const ctx = useContext(TerminalContext)
  if (!ctx) throw new Error("useTerminal must be used within TerminalProvider")
  return ctx
}
