import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal, createEffect, onMount, onCleanup } from "solid-js"
import { useServer } from "~/context/server"
import type { SSEEvent } from "~/lib/types"

type EventCallback = (event: SSEEvent) => void

interface GlobalSDKState {
  on: (directory: string, callback: EventCallback) => () => void
  onGlobal: (callback: EventCallback) => () => void
}

const GlobalSDKContext = createContext<GlobalSDKState>()

export const GlobalSDKProvider: ParentComponent = (props) => {
  const server = useServer()

  const directoryListeners = new Map<string, Set<EventCallback>>()
  const globalListeners = new Set<EventCallback>()

  let eventSource: EventSource | null = null
  let eventQueue: SSEEvent[] = []
  let rafHandle = 0
  const [lastEventTime, setLastEventTime] = createSignal(Date.now())
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 5
  const MAX_BACKOFF_MS = 30_000

  function coalesceQueue(queue: SSEEvent[]): SSEEvent[] {
    const result: SSEEvent[] = []
    const partUpdatedMap = new Map<string, number>()

    for (let i = 0; i < queue.length; i++) {
      const event = queue[i]
      if (event.type === "message.part.updated") {
        const data = event.data as { id?: string; messageID?: string }
        const key = `${event.directory ?? ""}:${data.messageID ?? ""}:${data.id ?? ""}`
        const existing = partUpdatedMap.get(key)
        if (existing !== undefined) {
          result[existing] = event
        } else {
          partUpdatedMap.set(key, result.length)
          result.push(event)
        }
      } else {
        result.push(event)
      }
    }

    return result
  }

  function flushQueue() {
    if (eventQueue.length === 0) {
      rafHandle = requestAnimationFrame(flushQueue)
      return
    }

    const coalesced = coalesceQueue(eventQueue)
    eventQueue = []

    for (const event of coalesced) {
      for (const cb of globalListeners) {
        try {
          cb(event)
        } catch {
          // listener error
        }
      }

      if (event.directory) {
        const listeners = directoryListeners.get(event.directory)
        if (listeners) {
          for (const cb of listeners) {
            try {
              cb(event)
            } catch {
              // listener error
            }
          }
        }
      }
    }

    rafHandle = requestAnimationFrame(flushQueue)
  }

  /** Returns true if the SSE connection is open or connecting */
  function isSSEActive(): boolean {
    return eventSource !== null && eventSource.readyState !== EventSource.CLOSED
  }

  function connectSSE() {
    if (!server.connected) return
    // Don't open a new connection if one is already active
    if (isSSEActive()) return

    if (eventSource) {
      eventSource.close()
      eventSource = null
    }

    const sdk = server.sdk
    const es = sdk.createEventSource("/global/event")

    es.onopen = () => {
      reconnectAttempts = 0
    }

    es.onmessage = (ev) => {
      setLastEventTime(Date.now())
      reconnectAttempts = 0
      try {
        const parsed: SSEEvent = JSON.parse(ev.data)
        eventQueue.push(parsed)
      } catch {
        // malformed event
      }
    }

    es.onerror = () => {
      es.close()
      eventSource = null
      clearReconnect()

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_BACKOFF_MS)
        reconnectAttempts++
        reconnectTimer = setTimeout(connectSSE, delay)
      }
    }

    eventSource = es
  }

  function disconnectSSE() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    clearReconnect()
  }

  function clearReconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = undefined
    }
  }

  // Connect/disconnect SSE based on server connection state
  createEffect(() => {
    if (server.connected) {
      reconnectAttempts = 0
      connectSSE()
    } else {
      disconnectSSE()
    }
  })

  onMount(() => {
    rafHandle = requestAnimationFrame(flushQueue)

    // Heartbeat: reconnect only if connection dropped silently (no events for 30s)
    heartbeatTimer = setInterval(() => {
      if (server.connected && !isSSEActive() && Date.now() - lastEventTime() > 30_000) {
        reconnectAttempts = 0
        connectSSE()
      }
    }, 15_000)

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && server.connected && !isSSEActive()) {
        reconnectAttempts = 0
        connectSSE()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    onCleanup(() => {
      disconnectSSE()
      cancelAnimationFrame(rafHandle)
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      document.removeEventListener("visibilitychange", handleVisibility)
    })
  })

  function on(directory: string, callback: EventCallback): () => void {
    if (!directoryListeners.has(directory)) {
      directoryListeners.set(directory, new Set())
    }
    directoryListeners.get(directory)!.add(callback)
    return () => {
      const set = directoryListeners.get(directory)
      if (set) {
        set.delete(callback)
        if (set.size === 0) directoryListeners.delete(directory)
      }
    }
  }

  function onGlobal(callback: EventCallback): () => void {
    globalListeners.add(callback)
    return () => {
      globalListeners.delete(callback)
    }
  }

  const state: GlobalSDKState = { on, onGlobal }

  return (
    <GlobalSDKContext.Provider value={state}>
      {props.children}
    </GlobalSDKContext.Provider>
  )
}

export function useGlobalSDK(): GlobalSDKState {
  const ctx = useContext(GlobalSDKContext)
  if (!ctx) throw new Error("useGlobalSDK must be used within GlobalSDKProvider")
  return ctx
}
