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

  async function checkHealth() {
    try {
      const ok = await sdk.health()
      setConnected(ok)
      if (ok) {
        setError(null)
        try {
          const result = await sdk.listProjects()
          setProjects(reconcile(result.projects))
        } catch {
          // projects fetch failed but server is up
        }
      } else {
        setConnected(false)
        setError("Server returned unhealthy status")
      }
    } catch (err) {
      setConnected(false)
      setError(err instanceof Error ? err.message : "Connection failed")
    }
  }

  async function connect(url: string) {
    setServerUrl(url)
    sdk = createSDKClient({ serverUrl: url })
    setError(null)
    setConnected(false)
    await checkHealth()
  }

  onMount(() => {
    checkHealth()
  })

  const timer = setInterval(checkHealth, 10000)
  onCleanup(() => clearInterval(timer))

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
