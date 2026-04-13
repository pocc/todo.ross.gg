import { createContext, useContext, type ParentComponent } from "solid-js"
import { createStore, produce } from "solid-js/store"

interface Comment {
  line: number
  text: string
  author: string
}

interface CommentsContextState {
  comments: Record<string, Comment[]>
  addComment: (file: string, line: number, text: string, author?: string) => void
  removeComment: (file: string, line: number, idx: number) => void
  getComments: (file: string) => Comment[]
  clearFile: (file: string) => void
  clearAll: () => void
}

const CommentsContext = createContext<CommentsContextState>()

export const CommentsProvider: ParentComponent = (props) => {
  const [comments, setComments] = createStore<Record<string, Comment[]>>({})

  function addComment(file: string, line: number, text: string, author: string = "user") {
    setComments(
      produce((store) => {
        if (!store[file]) store[file] = []
        store[file].push({ line, text, author })
      })
    )
  }

  function removeComment(file: string, line: number, idx: number) {
    setComments(
      produce((store) => {
        if (!store[file]) return
        const lineComments = store[file].filter((c) => c.line === line)
        if (idx >= 0 && idx < lineComments.length) {
          const target = lineComments[idx]
          const globalIdx = store[file].indexOf(target)
          if (globalIdx !== -1) {
            store[file].splice(globalIdx, 1)
          }
        }
      })
    )
  }

  function getComments(file: string): Comment[] {
    return comments[file] ?? []
  }

  function clearFile(file: string) {
    setComments(
      produce((store) => {
        delete store[file]
      })
    )
  }

  function clearAll() {
    setComments({})
  }

  const state: CommentsContextState = {
    get comments() {
      return comments
    },
    addComment,
    removeComment,
    getComments,
    clearFile,
    clearAll,
  }

  return (
    <CommentsContext.Provider value={state}>
      {props.children}
    </CommentsContext.Provider>
  )
}

export function useComments(): CommentsContextState {
  const ctx = useContext(CommentsContext)
  if (!ctx) throw new Error("useComments must be used within CommentsProvider")
  return ctx
}
