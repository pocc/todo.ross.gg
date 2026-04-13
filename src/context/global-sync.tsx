import { createContext, useContext, type ParentComponent } from "solid-js"
import { createStore, produce, reconcile } from "solid-js/store"
import { onMount, onCleanup } from "solid-js"
import { useServer } from "~/context/server"
import { useGlobalSDK } from "~/context/global-sdk"
import type { Project, Session, Config, SSEEvent } from "~/lib/types"

interface GlobalSyncState {
  projects: Project[]
  sessions: Record<string, Session[]>
  config: Config | null
  auth: Record<string, boolean>
  loadSessions: (directory: string) => Promise<void>
  loadMoreSessions: (directory: string, cursor: string) => Promise<void>
}

const GlobalSyncContext = createContext<GlobalSyncState>()

export const GlobalSyncProvider: ParentComponent = (props) => {
  const server = useServer()
  const globalSDK = useGlobalSDK()

  const [store, setStore] = createStore<{
    projects: Project[]
    sessions: Record<string, Session[]>
    config: Config | null
    auth: Record<string, boolean>
  }>({
    projects: [],
    sessions: {},
    config: null,
    auth: {},
  })

  const sessionCursors = new Map<string, string | undefined>()

  function applyGlobalEvent(event: SSEEvent) {
    const data = event.data as Record<string, unknown>

    switch (event.type) {
      case "session.created": {
        const session = data as unknown as Session
        const dir = event.directory ?? ""
        setStore(
          produce((s) => {
            if (!s.sessions[dir]) s.sessions[dir] = []
            const existing = s.sessions[dir].findIndex((x) => x.id === session.id)
            if (existing === -1) {
              s.sessions[dir].unshift(session)
            }
          })
        )
        break
      }
      case "session.updated": {
        const session = data as unknown as Session
        const dir = event.directory ?? ""
        setStore(
          produce((s) => {
            if (!s.sessions[dir]) return
            const idx = s.sessions[dir].findIndex((x) => x.id === session.id)
            if (idx !== -1) {
              s.sessions[dir][idx] = session
            }
          })
        )
        break
      }
      case "session.deleted": {
        const { id } = data as { id: string }
        const dir = event.directory ?? ""
        setStore(
          produce((s) => {
            if (!s.sessions[dir]) return
            const idx = s.sessions[dir].findIndex((x) => x.id === id)
            if (idx !== -1) {
              s.sessions[dir].splice(idx, 1)
            }
          })
        )
        break
      }
      case "session.status": {
        const { id, status } = data as { id: string; status: Session["status"] }
        const dir = event.directory ?? ""
        setStore(
          produce((s) => {
            if (!s.sessions[dir]) return
            const session = s.sessions[dir].find((x) => x.id === id)
            if (session) {
              session.status = status
            }
          })
        )
        break
      }
      case "workspace.ready": {
        loadConfig()
        break
      }
      default:
        break
    }
  }

  function applyDirectoryEvent(dir: string, event: SSEEvent) {
    applyGlobalEvent({ ...event, directory: dir })
  }

  async function loadConfig() {
    try {
      const config = await server.sdk.getConfig()
      setStore("config", reconcile(config))
    } catch {
      // config load failed
    }
  }

  async function loadSessions(directory: string) {
    try {
      const sdk = server.sdk
      sdk.setDirectory(directory)
      const result = await sdk.listSessions()
      setStore("sessions", directory, reconcile(result.sessions))
      sessionCursors.set(directory, result.cursor)
    } catch {
      // session load failed
    }
  }

  async function loadMoreSessions(directory: string, cursor: string) {
    try {
      const sdk = server.sdk
      sdk.setDirectory(directory)
      const result = await sdk.listSessions(cursor)
      setStore(
        produce((s) => {
          if (!s.sessions[directory]) s.sessions[directory] = []
          for (const session of result.sessions) {
            const exists = s.sessions[directory].some((x) => x.id === session.id)
            if (!exists) {
              s.sessions[directory].push(session)
            }
          }
        })
      )
      sessionCursors.set(directory, result.cursor)
    } catch {
      // load more failed
    }
  }

  onMount(() => {
    loadConfig()

    const projects = server.projects
    setStore("projects", reconcile(projects))
  })

  const unsubGlobal = globalSDK.onGlobal((event) => {
    applyGlobalEvent(event)
  })

  onCleanup(() => {
    unsubGlobal()
  })

  const state: GlobalSyncState = {
    get projects() {
      return store.projects
    },
    get sessions() {
      return store.sessions
    },
    get config() {
      return store.config
    },
    get auth() {
      return store.auth
    },
    loadSessions,
    loadMoreSessions,
  }

  return (
    <GlobalSyncContext.Provider value={state}>
      {props.children}
    </GlobalSyncContext.Provider>
  )
}

export function useGlobalSync(): GlobalSyncState {
  const ctx = useContext(GlobalSyncContext)
  if (!ctx) throw new Error("useGlobalSync must be used within GlobalSyncProvider")
  return ctx
}
