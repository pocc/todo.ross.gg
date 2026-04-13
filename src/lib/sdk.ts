import type { Session, Message, Config, Project, PtySession, FileDiff, Todo } from "./types"

const DEFAULT_SERVER_URL = "http://localhost:4096"

export interface SDKOptions {
  serverUrl?: string
  directory?: string
  workspace?: string
}

export function getServerUrl(): string {
  if (import.meta.env.VITE_OPENCODE_SERVER_URL) {
    return import.meta.env.VITE_OPENCODE_SERVER_URL
  }
  if (import.meta.env.VITE_OPENCODE_SERVER_HOST) {
    return `http://${import.meta.env.VITE_OPENCODE_SERVER_HOST}:${import.meta.env.VITE_OPENCODE_SERVER_PORT || "4096"}`
  }
  // Always default to localhost:4096 — the user's local opencode server
  return DEFAULT_SERVER_URL
}

function createFetch(options: SDKOptions) {
  const baseUrl = options.serverUrl || getServerUrl()

  return async (path: string, init?: RequestInit & { timeout?: number }): Promise<Response> => {
    const url = new URL(path, baseUrl)
    if (options.directory) url.searchParams.set("directory", options.directory)
    if (options.workspace) url.searchParams.set("workspace", options.workspace)

    const headers = new Headers(init?.headers)
    if (options.directory) headers.set("x-opencode-directory", options.directory)
    if (options.workspace) headers.set("x-opencode-workspace", options.workspace)
    headers.set("Content-Type", "application/json")

    const controller = new AbortController()
    const timeout = init?.timeout ?? 30000
    let timer: ReturnType<typeof setTimeout> | undefined
    if (timeout > 0) {
      timer = setTimeout(() => controller.abort(), timeout)
    }

    try {
      return await fetch(url.toString(), {
        ...init,
        headers,
        signal: init?.signal || controller.signal,
      })
    } finally {
      if (timer) clearTimeout(timer)
    }
  }
}

export function createSDKClient(options: SDKOptions = {}) {
  const request = createFetch(options)

  async function json<T>(path: string, init?: RequestInit & { timeout?: number }): Promise<T> {
    const res = await request(path, init)
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`SDK error ${res.status}: ${text}`)
    }
    return res.json()
  }

  return {
    get baseUrl() {
      return options.serverUrl || getServerUrl()
    },

    setDirectory(dir: string) {
      options.directory = dir
    },

    // Health — verify response is JSON (not SPA fallback HTML)
    health: async () => {
      try {
        const r = await request("/global/health")
        if (!r.ok) return false
        const ct = r.headers.get("content-type") || ""
        if (!ct.includes("application/json")) return false
        await r.json()
        return true
      } catch {
        return false
      }
    },

    // Config
    getConfig: () => json<Config>("/global/config"),
    updateConfig: (patch: Partial<Config>) =>
      json<Config>("/global/config", { method: "PATCH", body: JSON.stringify(patch) }),
    getLocalConfig: () => json<Config>("/config"),
    updateLocalConfig: (patch: Partial<Config>) =>
      json<Config>("/config", { method: "PATCH", body: JSON.stringify(patch) }),
    getProviders: () => json<{ providers: Record<string, unknown> }>("/config/providers"),

    // Auth
    setAuth: (providerID: string, credentials: Record<string, string>) =>
      json<void>(`/auth/${providerID}`, { method: "PUT", body: JSON.stringify(credentials) }),
    removeAuth: (providerID: string) =>
      request(`/auth/${providerID}`, { method: "DELETE" }),

    // Sessions
    listSessions: (cursor?: string) =>
      json<{ sessions: Session[]; cursor?: string }>(
        `/session${cursor ? `?cursor=${cursor}` : ""}`
      ),
    createSession: (data: { model?: string; provider?: string; title?: string; system?: string }) =>
      json<Session>("/session", { method: "POST", body: JSON.stringify(data) }),
    getSession: (id: string) => json<Session>(`/session/${id}`),
    updateSession: (id: string, patch: Partial<Session>) =>
      json<Session>(`/session/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    deleteSession: (id: string) => request(`/session/${id}`, { method: "DELETE" }),
    abortSession: (id: string) =>
      json<void>(`/session/${id}/abort`, { method: "POST" }),
    forkSession: (id: string, data?: { messageID?: string }) =>
      json<Session>(`/session/${id}/fork`, { method: "POST", body: JSON.stringify(data || {}) }),
    shareSession: (id: string) =>
      json<{ url: string }>(`/session/${id}/share`, { method: "POST" }),
    summarizeSession: (id: string) =>
      json<{ summary: string }>(`/session/${id}/summarize`, { method: "POST" }),

    // Messages
    getMessages: (sessionId: string) =>
      json<{ messages: Message[] }>(`/session/${sessionId}/message`),
    sendMessage: (sessionId: string, parts: unknown[], options?: { signal?: AbortSignal }) =>
      request(`/session/${sessionId}/message`, {
        method: "POST",
        body: JSON.stringify({ parts }),
        timeout: 0,
        signal: options?.signal,
      }),

    // Diffs
    getSessionDiff: (sessionId: string) =>
      json<{ files: FileDiff[] }>(`/session/${sessionId}/diff`),

    // Todos
    getSessionTodos: (sessionId: string) =>
      json<{ todos: Todo[] }>(`/session/${sessionId}/todo`),

    // PTY
    listPty: () => json<{ sessions: PtySession[] }>("/pty"),
    createPty: (data: { directory?: string }) =>
      json<PtySession>("/pty", { method: "POST", body: JSON.stringify(data) }),
    deletePty: (id: string) => request(`/pty/${id}`, { method: "DELETE" }),
    connectPtyUrl: (id: string, cursor?: string) => {
      const base = options.serverUrl || getServerUrl()
      const url = new URL(`/pty/${id}/connect`, base)
      url.protocol = url.protocol.replace("http", "ws")
      if (options.directory) url.searchParams.set("directory", options.directory)
      if (cursor) url.searchParams.set("cursor", cursor)
      return url.toString()
    },

    // Projects — API returns a flat array, not wrapped
    listProjects: async () => {
      const projects = await json<any[]>("/project")
      // Normalize: API uses unix timestamps, derive name from worktree
      return projects.map((p: any) => ({
        id: p.id,
        worktree: p.worktree,
        name: p.worktree === "/" ? "/" : p.worktree.split("/").pop() || p.worktree,
        git: p.vcs === "git" ? { branch: p.branch } : undefined,
        time: {
          created: typeof p.time?.created === "number" ? new Date(p.time.created).toISOString() : p.time?.created,
          updated: typeof p.time?.updated === "number" ? new Date(p.time.updated).toISOString() : p.time?.updated,
        },
      })) as Project[]
    },
    initProject: (directory: string) =>
      json<Project>("/project", { method: "POST", body: JSON.stringify({ directory }) }),

    // SSE
    createEventSource: (path = "/global/event") => {
      const base = options.serverUrl || getServerUrl()
      const url = new URL(path, base)
      if (options.directory) url.searchParams.set("directory", options.directory)
      return new EventSource(url.toString())
    },
  }
}

export type SDKClient = ReturnType<typeof createSDKClient>
