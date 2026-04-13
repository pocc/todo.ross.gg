import { type Component } from "solid-js"
import { Dialog } from "~/ui/components/dialog"

export interface ReleaseNotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const VERSION = "0.1.0"

const sections: Array<{ title: string; items: string[] }> = [
  {
    title: "New Features",
    items: [
      "Interactive terminal with WebSocket PTY support",
      "Command palette with keyboard navigation",
      "Settings dialog with theme picker and keybind editor",
      "Model selection with provider management",
      "Session forking and sharing",
      "File tree viewer with directory expansion",
      "Debug bar for development diagnostics",
    ],
  },
  {
    title: "Improvements",
    items: [
      "Theme preview on hover in settings",
      "Exponential backoff for terminal reconnection",
      "Recent directories saved to localStorage",
      "Keyboard shortcut capture for custom keybinds",
      "Responsive settings dialog with sidebar navigation",
    ],
  },
  {
    title: "Technical",
    items: [
      "Built with SolidJS and Kobalte UI primitives",
      "CSS custom properties for consistent theming",
      "TypeScript throughout with strict type checking",
      "Context-based state management",
    ],
  },
]

export const ReleaseNotesDialog: Component<ReleaseNotesDialogProps> = (props) => {
  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="What's New"
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "20px" }}>
        {/* Version badge */}
        <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <span
            style={{
              padding: "3px 10px",
              "font-size": "12px",
              "font-weight": "600",
              "font-family": "var(--oc-font-mono)",
              color: "var(--oc-accent-text)",
              background: "var(--oc-accent-primary)",
              "border-radius": "var(--oc-radius-sm)",
            }}
          >
            v{VERSION}
          </span>
          <span
            style={{
              "font-size": "12px",
              color: "var(--oc-text-tertiary)",
            }}
          >
            OpenCode Web UI
          </span>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div>
            <h3
              style={{
                "font-size": "14px",
                "font-weight": "600",
                color: "var(--oc-text-primary)",
                margin: "0 0 8px 0",
              }}
            >
              {section.title}
            </h3>
            <ul
              style={{
                margin: "0",
                padding: "0 0 0 20px",
                display: "flex",
                "flex-direction": "column",
                gap: "4px",
              }}
            >
              {section.items.map((item) => (
                <li
                  style={{
                    "font-size": "13px",
                    color: "var(--oc-text-secondary)",
                    "line-height": "1.5",
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Dialog>
  )
}
