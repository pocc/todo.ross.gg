import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal, onMount, onCleanup } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { createSDKClient, getServerUrl, type SDKClient } from "~/lib/sdk"
import type { Project } from "~/lib/types"

interface ServerState {
  serverUrl: string
  connected: boolean
  error: string | null
  projects: Project[]
  sdk: SDKClient
  connect: (url: string) => Promise<void>
}

const ServerContext = createContext<ServerState>()

export const ServerProvider: ParentComponent = (props) => {
  const [serverUrl, setServerUrl] = createSignal(getServerUrl())
  const [connected, setConnected] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [projects, setProjects] = createStore<Project[]>([])

  let sdk = createSDKClient({ serverUrl: serverUrl() })
  let consecutiveFailures = 0

  async function checkHealth() {
    try {
      const ok = await sdk.health()
      if (ok) {
        setConnected(true)
        setError(null)
        consecutiveFailures = 0
        try {
          const projects = await sdk.listProjects()
          setProjects(reconcile(projects))
        } catch {
          // projects fetch failed but server is up
        }
      } else {
        setConnected(false)
        consecutiveFailures++
        setError("Server returned unhealthy status")
      }
    } catch (err) {
      setConnected(false)
      consecutiveFailures++
      // Only set error on first failure or explicit connect attempt
      if (consecutiveFailures <= 1) {
        setError(err instanceof Error ? err.message : "Connection failed")
      }
    }
  }

  async function connect(url: string) {
    const isNewUrl = url !== serverUrl()
    setServerUrl(url)
    sdk = createSDKClient({ serverUrl: url })
    setError(null)
    if (isNewUrl) setConnected(false)
    consecutiveFailures = 0
    await checkHealth()
  }

  onMount(() => {
    checkHealth()
  })

  // Health polling with backoff: 10s when connected, increasing intervals when disconnected
  // Max poll interval: 60s when server is down
  let pollTimer: ReturnType<typeof setTimeout> | undefined

  function schedulePoll() {
    const delay = connected()
      ? 10_000
      : Math.min(10_000 * Math.pow(2, Math.min(consecutiveFailures, 4)), 60_000)
    pollTimer = setTimeout(async () => {
      await checkHealth()
      schedulePoll()
    }, delay)
  }

  onMount(() => {
    schedulePoll()
  })

  onCleanup(() => {
    if (pollTimer) clearTimeout(pollTimer)
  })

  const state: ServerState = {
    get serverUrl() {
      return serverUrl()
    },
    get connected() {
      return connected()
    },
    get error() {
      return error()
    },
    get projects() {
      return projects
    },
    get sdk() {
      return sdk
    },
    connect,
  }

  return (
    <ServerContext.Provider value={state}>
      {props.children}
    </ServerContext.Provider>
  )
}

export function useServer(): ServerState {
  const ctx = useContext(ServerContext)
  if (!ctx) throw new Error("useServer must be used within ServerProvider")
  return ctx
}
