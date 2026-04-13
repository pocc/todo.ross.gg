import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal } from "solid-js"
import { createStore, produce } from "solid-js/store"

interface PermissionRequest {
  id: string
  sessionId: string
  toolName: string
  args: Record<string, unknown>
  description?: string
  time: number
}

interface PermissionContextState {
  pending: PermissionRequest[]
  autoAccepted: () => Map<string, number>
  ask: (request: PermissionRequest) => boolean
  reply: (id: string, accepted: boolean, autoAcceptKey?: string) => void
  reject: (id: string) => void
}

const AUTO_ACCEPT_TTL = 3600 * 1000 // 1 hour in ms

const PermissionContext = createContext<PermissionContextState>()

export const PermissionProvider: ParentComponent = (props) => {
  const [pending, setPending] = createStore<PermissionRequest[]>([])
  const [autoAccepted, setAutoAccepted] = createSignal<Map<string, number>>(new Map())

  function pruneExpired(map: Map<string, number>): Map<string, number> {
    const now = Date.now()
    const pruned = new Map<string, number>()
    for (const [key, ts] of map) {
      if (now - ts < AUTO_ACCEPT_TTL) {
        pruned.set(key, ts)
      }
    }
    return pruned
  }

  function ask(request: PermissionRequest): boolean {
    const current = pruneExpired(autoAccepted())
    setAutoAccepted(current)

    const autoKey = `${request.toolName}:${JSON.stringify(request.args)}`
    if (current.has(autoKey)) {
      return true
    }

    const exists = pending.some((p) => p.id === request.id)
    if (!exists) {
      setPending(produce((arr) => {
        arr.push(request)
      }))
    }
    return false
  }

  function reply(id: string, accepted: boolean, autoAcceptKey?: string) {
    setPending(produce((arr) => {
      const idx = arr.findIndex((p) => p.id === id)
      if (idx !== -1) arr.splice(idx, 1)
    }))

    if (accepted && autoAcceptKey) {
      setAutoAccepted((prev) => {
        const next = new Map(prev)
        next.set(autoAcceptKey, Date.now())
        return next
      })
    }
  }

  function reject(id: string) {
    setPending(produce((arr) => {
      const idx = arr.findIndex((p) => p.id === id)
      if (idx !== -1) arr.splice(idx, 1)
    }))
  }

  const state: PermissionContextState = {
    get pending() {
      return pending
    },
    autoAccepted,
    ask,
    reply,
    reject,
  }

  return (
    <PermissionContext.Provider value={state}>
      {props.children}
    </PermissionContext.Provider>
  )
}

export function usePermission(): PermissionContextState {
  const ctx = useContext(PermissionContext)
  if (!ctx) throw new Error("usePermission must be used within PermissionProvider")
  return ctx
}
