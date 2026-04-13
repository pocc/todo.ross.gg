import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal, createEffect } from "solid-js"
import { createLRUCache } from "~/lib/persist"

interface AttachedFile {
  name: string
  path: string
  size: number
}

interface AttachedImage {
  name: string
  url: string
  mediaType: string
}

interface PromptState {
  sessionId: string
  text: string
  files: AttachedFile[]
  images: AttachedImage[]
  agentMention: string | null
}

interface PromptContextState {
  text: () => string
  files: () => AttachedFile[]
  images: () => AttachedImage[]
  agentMention: () => string | null
  setText: (v: string) => void
  addFile: (f: AttachedFile) => void
  removeFile: (idx: number) => void
  addImage: (img: AttachedImage) => void
  removeImage: (idx: number) => void
  clear: () => void
  setAgentMention: (agent: string | null) => void
  switchSession: (sessionId: string) => void
}

const PromptContext = createContext<PromptContextState>()

const EMPTY_STATE: Omit<PromptState, "sessionId"> = {
  text: "",
  files: [],
  images: [],
  agentMention: null,
}

export const PromptProvider: ParentComponent<{ sessionId: string }> = (props) => {
  const cache = createLRUCache<Omit<PromptState, "sessionId">>("prompt.sessions", 20)

  const [text, setText] = createSignal("")
  const [files, setFiles] = createSignal<AttachedFile[]>([])
  const [images, setImages] = createSignal<AttachedImage[]>([])
  const [agentMention, setAgentMention] = createSignal<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = createSignal(props.sessionId)

  function saveToCache(sessionId: string) {
    cache.set(sessionId, {
      text: text(),
      files: files(),
      images: images(),
      agentMention: agentMention(),
    })
  }

  function restoreFromCache(sessionId: string) {
    const saved = cache.get(sessionId)
    if (saved) {
      setText(saved.text)
      setFiles(saved.files)
      setImages(saved.images)
      setAgentMention(saved.agentMention)
    } else {
      setText(EMPTY_STATE.text)
      setFiles(EMPTY_STATE.files)
      setImages(EMPTY_STATE.images)
      setAgentMention(EMPTY_STATE.agentMention)
    }
  }

  restoreFromCache(props.sessionId)

  function switchSession(sessionId: string) {
    saveToCache(currentSessionId())
    setCurrentSessionId(sessionId)
    restoreFromCache(sessionId)
  }

  createEffect(() => {
    if (props.sessionId !== currentSessionId()) {
      switchSession(props.sessionId)
    }
  })

  function addFile(f: AttachedFile) {
    setFiles((prev) => [...prev, f])
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  function addImage(img: AttachedImage) {
    setImages((prev) => [...prev, img])
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  function clear() {
    setText("")
    setFiles([])
    setImages([])
    setAgentMention(null)
    cache.remove(currentSessionId())
  }

  const state: PromptContextState = {
    text,
    files,
    images,
    agentMention,
    setText,
    addFile,
    removeFile,
    addImage,
    removeImage,
    clear,
    setAgentMention,
    switchSession,
  }

  return (
    <PromptContext.Provider value={state}>
      {props.children}
    </PromptContext.Provider>
  )
}

export function usePrompt(): PromptContextState {
  const ctx = useContext(PromptContext)
  if (!ctx) throw new Error("usePrompt must be used within PromptProvider")
  return ctx
}
