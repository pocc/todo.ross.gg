import { Component } from "solid-js"
import { useTheme } from "~/ui/theme"

export const ThemeToggle: Component = () => {
  const theme = useTheme()

  function toggle() {
    const current = theme.resolvedMode()
    theme.setMode(current === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggle}
      title={`Switch to ${theme.resolvedMode() === "dark" ? "light" : "dark"} mode`}
      style={{
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        width: "32px",
        height: "32px",
        background: "none",
        border: "1px solid var(--oc-border-primary)",
        "border-radius": "var(--oc-radius-md)",
        cursor: "pointer",
        color: "var(--oc-text-secondary)",
        transition: "background 100ms ease, color 100ms ease, border-color 100ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--oc-bg-hover)"
        e.currentTarget.style.color = "var(--oc-text-primary)"
        e.currentTarget.style.borderColor = "var(--oc-border-focus)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none"
        e.currentTarget.style.color = "var(--oc-text-secondary)"
        e.currentTarget.style.borderColor = "var(--oc-border-primary)"
      }}
    >
      {theme.resolvedMode() === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
