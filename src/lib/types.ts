export interface Project {
  id: string
  worktree: string
  name: string
  git?: {
    branch?: string
    dirty?: boolean
    remote?: string
  }
  time: {
    created: string
    updated: string
  }
}

export interface Session {
  id: string
  parentID?: string
  title: string
  description?: string
  model: {
    provider: string
    model: string
    options?: Record<string, unknown>
  }
  status: "idle" | "running" | "error"
  share?: {
    url: string
    id: string
  }
  version: number
  generation: number
  time: {
    created: string
    updated: string
  }
}

export type MessageRole = "user" | "assistant"

export interface UserMessage {
  id: string
  sessionID: string
  role: "user"
  parts: MessagePart[]
  time: {
    created: string
    updated: string
  }
}

export interface AssistantMessage {
  id: string
  sessionID: string
  role: "assistant"
  parts: MessagePart[]
  metadata?: {
    model?: string
    provider?: string
    tokens?: {
      input: number
      output: number
    }
    cost?: number
  }
  time: {
    created: string
    updated: string
  }
}

export type Message = UserMessage | AssistantMessage

export type MessagePart = TextPart | ToolInvocationPart | FilePart | ReasoningPart

export interface TextPart {
  type: "text"
  content: string
  state: "pending" | "running" | "done"
  thinking?: boolean
}

export interface ToolInvocationPart {
  type: "tool-invocation"
  toolName: string
  toolCallId: string
  args: Record<string, unknown>
  result?: unknown
  state: "pending" | "running" | "completed" | "error"
  diagnostics?: Array<{
    severity: "error" | "warning" | "info"
    message: string
  }>
}

export interface FilePart {
  type: "file"
  mediaType: string
  url: string
  filename: string
}

export interface ReasoningPart {
  type: "reasoning"
  content: string
  redacted?: boolean
}

export interface ProviderConfig {
  id: string
  name: string
  api?: string
  models: Array<{
    id: string
    name: string
  }>
}

export interface Config {
  providers: Record<string, ProviderConfig>
  agents: Record<string, unknown>
  mcp: Record<string, unknown>
  permissions: Record<string, unknown>
  commands: Record<string, unknown>
}

export interface PtySession {
  id: string
  directory: string
  running: boolean
  time: {
    created: string
    updated: string
  }
}

export interface FileDiff {
  path: string
  oldPath?: string
  status: "added" | "modified" | "deleted" | "renamed"
  additions: number
  deletions: number
  hunks: DiffHunk[]
}

export interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

export interface DiffLine {
  type: "add" | "del" | "normal"
  content: string
  oldNumber?: number
  newNumber?: number
}

export interface Todo {
  id: string
  content: string
  completed: boolean
}

export type SSEEventType =
  | "session.created"
  | "session.updated"
  | "session.deleted"
  | "session.status"
  | "message.updated"
  | "message.part.updated"
  | "permission.asked"
  | "permission.replied"
  | "permission.rejected"
  | "workspace.ready"
  | "pty.resize"
  | "pty.delete"
  | "mcp.status"
  | "lsp.diagnostics"
  | "file.watch"

export interface SSEEvent {
  type: SSEEventType
  directory?: string
  data: unknown
}

export type ThemeMode = "light" | "dark" | "system"

export interface ThemeVariant {
  seeds?: ThemeSeedColors
  palette?: ThemePaletteColors
}

export interface ThemeSeedColors {
  neutral: string
  primary: string
  success: string
  warning: string
  error: string
  info: string
  interactive: string
  diffAdd: string
  diffDelete: string
}

export interface ThemePaletteColors {
  neutral: Record<string, string>
  ink: Record<string, string>
  primary: Record<string, string>
  success: Record<string, string>
  warning: Record<string, string>
  error: Record<string, string>
  info: Record<string, string>
  accent: Record<string, string>
  interactive: Record<string, string>
  diffAdd: Record<string, string>
  diffDelete: Record<string, string>
}

export interface DesktopTheme {
  id: string
  name: string
  light: ThemeVariant
  dark: ThemeVariant
}

export interface LayoutState {
  sidebarWidth: number
  sidebarCollapsed: boolean
  terminalHeight: number
  terminalVisible: boolean
  reviewPanelWidth: number
  reviewPanelVisible: boolean
  fileTreeWidth: number
  fileTreeVisible: boolean
  activeTab: "todos" | "chats"
}

export interface Settings {
  appearance: {
    theme: string
    mode: ThemeMode
    fontSize: number
    fontFamily: string
    monoFontFamily: string
  }
  keybinds: Record<string, string>
  permissions: {
    autoAccept: boolean
    ttl: number
  }
  notifications: {
    enabled: boolean
    sound: boolean
  }
}

export interface CommandItem {
  id: string
  label: string
  shortcut?: string
  group?: string
  action: () => void
}
