import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal, onMount, onCleanup } from "solid-js"
import { createStore, produce, reconcile } from "solid-js/store"
import { useServer } from "~/context/server"
import { useGlobalSDK } from "~/context/global-sdk"
import type { Message, FileDiff, Todo, SSEEvent, MessagePart } from "~/lib/types"

interface SyncState {
  messages: Message[]
  diffs: FileDiff[]
  todos: Todo[]
  loading: boolean
  hasMore: boolean
  loadMessages: () => Promise<void>
  loadMore: () => Promise<void>
  sendMessage: (parts: MessagePart[]) => Promise<void>
  loadDiffs: () => Promise<void>
  loadTodos: () => Promise<void>
}

interface SyncProviderProps {
  sessionId: string
  children: import("solid-js").JSX.Element
}

const SyncContext = createContext<SyncState>()

export const SyncProvider: ParentComponent<{ sessionId: string }> = (props) => {
  const server = useServer()
  const globalSDK = useGlobalSDK()

  const [messages, setMessages] = createStore<Message[]>([])
  const [diffs, setDiffs] = createStore<FileDiff[]>([])
  const [todos, setTodos] = createStore<Todo[]>([])
  const [loading, setLoading] = createSignal(false)
  const [hasMore, setHasMore] = createSignal(false)

  let abortController: AbortController | null = null

  async function loadMessages() {
    setLoading(true)
    try {
      const result = await server.sdk.getMessages(props.sessionId)
      setMessages(reconcile(result.messages))
    } catch {
      // load failed
    } finally {
      setLoading(false)
    }
  }

  async function loadMore() {
    // Messages endpoint currently returns all messages.
    // This is a placeholder for cursor-based pagination if the API adds it.
    setHasMore(false)
  }

  async function sendMessage(parts: MessagePart[]) {
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const optimisticMessage: Message = {
      id: optimisticId,
      sessionID: props.sessionId,
      role: "user",
      parts,
      time: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    }

    setMessages(produce((msgs) => {
      msgs.push(optimisticMessage)
    }))

    try {
      abortController = new AbortController()
      const response = await server.sdk.sendMessage(
        props.sessionId,
        parts,
        { signal: abortController.signal }
      )

      if (!response.ok) {
        setMessages(produce((msgs) => {
          const idx = msgs.findIndex((m) => m.id === optimisticId)
          if (idx !== -1) msgs.splice(idx, 1)
        }))
        return
      }

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const jsonStr = line.slice(6)
          if (jsonStr === "[DONE]") continue

          try {
            const event: SSEEvent = JSON.parse(jsonStr)
            if (event.type === "message.updated") {
              const msg = event.data as unknown as Message
              setMessages(produce((msgs) => {
                const optIdx = msgs.findIndex((m) => m.id === optimisticId)
                if (optIdx !== -1 && msg.role === "user") {
                  msgs[optIdx] = msg
                } else {
                  const existIdx = msgs.findIndex((m) => m.id === msg.id)
                  if (existIdx !== -1) {
                    msgs[existIdx] = msg
                  } else {
                    msgs.push(msg)
                  }
                }
              }))
            } else if (event.type === "message.part.updated") {
              const partData = event.data as {
                messageID: string
                index: number
                part: MessagePart
              }
              setMessages(produce((msgs) => {
                const msg = msgs.find((m) => m.id === partData.messageID)
                if (msg) {
                  if (!msg.parts[partData.index]) {
                    msg.parts.push(partData.part)
                  } else {
                    msg.parts[partData.index] = partData.part
                  }
                }
              }))
            }
          } catch {
            // malformed SSE data
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      setMessages(produce((msgs) => {
        const idx = msgs.findIndex((m) => m.id === optimisticId)
        if (idx !== -1) msgs.splice(idx, 1)
      }))
    } finally {
      abortController = null
    }
  }

  async function loadDiffs() {
    try {
      const result = await server.sdk.getSessionDiff(props.sessionId)
      setDiffs(reconcile(result.files))
    } catch {
      // diff load failed
    }
  }

  async function loadTodos() {
    try {
      const result = await server.sdk.getSessionTodos(props.sessionId)
      setTodos(reconcile(result.todos))
    } catch {
      // todo load failed
    }
  }

  onMount(() => {
    loadMessages()
  })

  const unsubGlobal = globalSDK.onGlobal((event) => {
    if (event.type === "message.updated") {
      const msg = event.data as unknown as Message
      if (msg.sessionID === props.sessionId) {
        setMessages(produce((msgs) => {
          const idx = msgs.findIndex((m) => m.id === msg.id)
          if (idx !== -1) {
            msgs[idx] = msg
          } else {
            msgs.push(msg)
          }
        }))
      }
    } else if (event.type === "message.part.updated") {
      const partData = event.data as {
        messageID: string
        sessionID?: string
        index: number
        part: MessagePart
      }
      if (partData.sessionID === props.sessionId) {
        setMessages(produce((msgs) => {
          const msg = msgs.find((m) => m.id === partData.messageID)
          if (msg) {
            if (!msg.parts[partData.index]) {
              msg.parts.push(partData.part)
            } else {
              msg.parts[partData.index] = partData.part
            }
          }
        }))
      }
    }
  })

  onCleanup(() => {
    unsubGlobal()
    if (abortController) {
      abortController.abort()
    }
  })

  const state: SyncState = {
    get messages() {
      return messages
    },
    get diffs() {
      return diffs
    },
    get todos() {
      return todos
    },
    get loading() {
      return loading()
    },
    get hasMore() {
      return hasMore()
    },
    loadMessages,
    loadMore,
    sendMessage,
    loadDiffs,
    loadTodos,
  }

  return (
    <SyncContext.Provider value={state}>
      {props.children}
    </SyncContext.Provider>
  )
}

export function useSync(): SyncState {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error("useSync must be used within SyncProvider")
  return ctx
}
