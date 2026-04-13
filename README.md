# OpenCode Web UI

A browser-based web UI for [OpenCode](https://github.com/anomalyco/opencode) — the open-source AI coding agent. Connect to a local OpenCode server and use the full coding assistant experience from your browser.

## Features

- **Full chat interface** — Send messages, view streaming responses, tool calls, and reasoning
- **37 built-in themes** — Catppuccin, Dracula, Nord, Gruvbox, Tokyo Night, and more with light/dark/system mode
- **Session management** — Create, fork, share, and navigate between sessions
- **Diff viewer** — Review file changes with syntax-highlighted diffs
- **Terminal** — Integrated PTY terminal via WebSocket
- **Command palette** — Quick access to all actions via Cmd/Ctrl+K
- **Markdown rendering** — Full markdown with syntax highlighting via Shiki
- **Multi-provider support** — Configure API keys for Claude, OpenAI, Google, and custom providers
- **Settings** — Customize fonts, keybinds, themes, and more

## Tech Stack

- **SolidJS** — Reactive UI framework
- **Vite** — Build tool
- **TailwindCSS v4** — Styling
- **Kobalte** — Accessible UI primitives
- **TanStack Solid Query** — Server state management
- **Shiki** — Syntax highlighting
- **Marked** — Markdown parsing

## Getting Started

### Prerequisites

- Node.js 18+
- A running OpenCode server (`opencode serve`)

### Install and Run

```bash
npm install
npm run dev
```

The app starts at `http://localhost:3000`.

### Connect to OpenCode Server

1. Start OpenCode server: `opencode serve`  (defaults to `localhost:4096`)
2. Open `http://localhost:3000` in your browser
3. Enter your server URL if different from the default
4. Select a project directory and start coding

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_OPENCODE_SERVER_URL` | `http://localhost:4096` | Full server URL |
| `VITE_OPENCODE_SERVER_HOST` | `localhost` | Server hostname |
| `VITE_OPENCODE_SERVER_PORT` | `4096` | Server port |

## Project Structure

```
src/
  entry.tsx              # App mount point
  app.tsx                # Router + provider hierarchy
  context/               # 16 SolidJS context providers
    server.tsx           # Server connection + SDK client
    global-sdk.tsx       # SSE event stream with 16ms batching
    global-sync.tsx      # Global reactive store
    sync.tsx             # Per-session message sync
    layout.tsx           # Persisted UI layout state
    settings.tsx         # User preferences
    command.tsx          # Command palette + keybinds
    ...
  pages/                 # Route pages
    home.tsx             # Project picker
    layout.tsx           # App shell with sidebar
    session.tsx          # Chat view
    session/             # Session sub-components
  components/            # App-level components
    terminal.tsx         # PTY terminal
    command-palette.tsx  # Cmd+K command palette
    settings/            # Settings panels
    dialog-*.tsx         # Various dialogs
  ui/                    # Reusable component library
    components/          # 35+ UI components (Button, Dialog, etc.)
    theme/               # Theme engine with 37 themes
  lib/                   # SDK client, types, utilities
```

## Build

```bash
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## License

MIT
