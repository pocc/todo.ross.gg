import { createContext, useContext, type ParentComponent } from "solid-js"
import { createStore, produce } from "solid-js/store"

interface FileContextState {
  files: Record<string, string>
  load: (path: string, fetcher: () => Promise<string>) => Promise<string>
  get: (path: string) => string | undefined
  evict: (path: string) => void
  clear: () => void
}

const MAX_CACHED_FILES = 100

const FileContext = createContext<FileContextState>()

export const FileProvider: ParentComponent = (props) => {
  const [files, setFiles] = createStore<Record<string, string>>({})
  const accessOrder: string[] = []

  function touchAccess(path: string) {
    const idx = accessOrder.indexOf(path)
    if (idx !== -1) accessOrder.splice(idx, 1)
    accessOrder.push(path)
  }

  function evictIfNeeded() {
    while (accessOrder.length > MAX_CACHED_FILES) {
      const oldest = accessOrder.shift()
      if (oldest) {
        setFiles(produce((f) => {
          delete f[oldest]
        }))
      }
    }
  }

  async function load(path: string, fetcher: () => Promise<string>): Promise<string> {
    const existing = files[path]
    if (existing !== undefined) {
      touchAccess(path)
      return existing
    }

    try {
      const content = await fetcher()
      setFiles(produce((f) => {
        f[path] = content
      }))
      touchAccess(path)
      evictIfNeeded()
      return content
    } catch (err) {
      throw err
    }
  }

  function get(path: string): string | undefined {
    const content = files[path]
    if (content !== undefined) {
      touchAccess(path)
    }
    return content
  }

  function evict(path: string) {
    setFiles(produce((f) => {
      delete f[path]
    }))
    const idx = accessOrder.indexOf(path)
    if (idx !== -1) accessOrder.splice(idx, 1)
  }

  function clear() {
    setFiles({})
    accessOrder.length = 0
  }

  const state: FileContextState = {
    get files() {
      return files
    },
    load,
    get,
    evict,
    clear,
  }

  return (
    <FileContext.Provider value={state}>
      {props.children}
    </FileContext.Provider>
  )
}

export function useFile(): FileContextState {
  const ctx = useContext(FileContext)
  if (!ctx) throw new Error("useFile must be used within FileProvider")
  return ctx
}
