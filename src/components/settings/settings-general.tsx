import { type Component, For, createSignal } from "solid-js"
import { useSettings } from "~/context/settings"
import { useTheme, themes } from "~/ui/theme"
import { Switch } from "~/ui/components/switch"
import { Select, type SelectOption } from "~/ui/components/select"
import type { ThemeMode } from "~/lib/types"

const fontFamilyOptions: SelectOption[] = [
  { value: "Inter", label: "Inter" },
  { value: "system-ui", label: "System UI" },
  { value: "SF Pro", label: "SF Pro" },
  { value: "Segoe UI", label: "Segoe UI" },
  { value: "Roboto", label: "Roboto" },
  { value: "Helvetica Neue", label: "Helvetica Neue" },
]

const monoFontOptions: SelectOption[] = [
  { value: "JetBrains Mono", label: "JetBrains Mono" },
  { value: "Fira Code", label: "Fira Code" },
  { value: "SF Mono", label: "SF Mono" },
  { value: "Cascadia Code", label: "Cascadia Code" },
  { value: "Source Code Pro", label: "Source Code Pro" },
  { value: "monospace", label: "Monospace (System)" },
]

const modeOptions: Array<{ id: ThemeMode; label: string }> = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
]

export const SettingsGeneral: Component = () => {
  const { settings, updateSettings } = useSettings()
  const themeCtx = useTheme()

  const sectionStyle = {
    "margin-bottom": "24px",
  }

  const sectionTitleStyle = {
    "font-size": "13px",
    "font-weight": "600",
    color: "var(--oc-text-primary)",
    "margin-bottom": "12px",
  }

  const rowStyle = {
    display: "flex",
    "align-items": "center",
    "justify-content": "space-between",
    padding: "8px 0",
  }

  const labelStyle = {
    "font-size": "13px",
    color: "var(--oc-text-secondary)",
  }

  return (
    <div>
      {/* Theme picker */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Theme</div>
        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "8px",
          }}
        >
          <For each={themeCtx.themes}>
            {(theme) => {
              const isActive = () => themeCtx.theme().id === theme.id
              const colors = () => {
                const mode = themeCtx.resolvedMode()
                return mode === "dark" ? theme.dark : theme.light
              }
              return (
                <button
                  onClick={() => {
                    themeCtx.setTheme(theme.id)
                    updateSettings("appearance.theme", theme.id)
                  }}
                  onMouseEnter={() => themeCtx.previewTheme(theme.id)}
                  onMouseLeave={() => themeCtx.cancelPreview()}
                  style={{
                    display: "flex",
                    "flex-direction": "column",
                    "align-items": "center",
                    gap: "6px",
                    padding: "8px",
                    background: "transparent",
                    border: isActive()
                      ? "2px solid var(--oc-accent-primary)"
                      : "2px solid var(--oc-border-primary)",
                    "border-radius": "var(--oc-radius-md)",
                    cursor: "pointer",
                    transition: "border-color 150ms ease",
                  }}
                >
                  {/* Color swatch preview */}
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: "24px",
                      "border-radius": "var(--oc-radius-sm)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ flex: "1", background: colors().bg }} />
                    <div style={{ flex: "1", background: colors().accent }} />
                    <div style={{ flex: "1", background: colors().surface }} />
                    <div style={{ flex: "1", background: colors().text }} />
                  </div>
                  <span
                    style={{
                      "font-size": "11px",
                      color: isActive() ? "var(--oc-text-primary)" : "var(--oc-text-tertiary)",
                      "font-weight": isActive() ? "500" : "400",
                      "white-space": "nowrap",
                      overflow: "hidden",
                      "text-overflow": "ellipsis",
                      "max-width": "100%",
                    }}
                  >
                    {theme.name}
                  </span>
                </button>
              )
            }}
          </For>
        </div>
      </div>

      {/* Mode selector */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Mode</div>
        <div style={{ display: "flex", gap: "4px" }}>
          <For each={modeOptions}>
            {(opt) => {
              const isActive = () => themeCtx.mode() === opt.id
              return (
                <button
                  onClick={() => {
                    themeCtx.setMode(opt.id)
                    updateSettings("appearance.mode", opt.id)
                  }}
                  style={{
                    padding: "6px 16px",
                    "font-size": "12px",
                    "font-family": "var(--oc-font-sans)",
                    "font-weight": "500",
                    color: isActive() ? "var(--oc-accent-text)" : "var(--oc-text-secondary)",
                    background: isActive() ? "var(--oc-accent-primary)" : "var(--oc-surface-secondary)",
                    border: isActive() ? "1px solid transparent" : "1px solid var(--oc-border-primary)",
                    "border-radius": "var(--oc-radius-md)",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive()) {
                      (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive()) {
                      (e.currentTarget as HTMLElement).style.background = "var(--oc-surface-secondary)"
                    }
                  }}
                >
                  {opt.label}
                </button>
              )
            }}
          </For>
        </div>
      </div>

      {/* Font size */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Font Size</div>
        <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
          <input
            type="range"
            min="10"
            max="22"
            step="1"
            value={settings.appearance.fontSize}
            onInput={(e) => {
              const val = parseInt((e.currentTarget as HTMLInputElement).value, 10)
              updateSettings("appearance.fontSize", val)
            }}
            style={{
              flex: "1",
              "accent-color": "var(--oc-accent-primary)",
            }}
          />
          <input
            type="number"
            min="10"
            max="22"
            value={settings.appearance.fontSize}
            onInput={(e) => {
              const val = parseInt((e.currentTarget as HTMLInputElement).value, 10)
              if (val >= 10 && val <= 22) {
                updateSettings("appearance.fontSize", val)
              }
            }}
            style={{
              width: "50px",
              padding: "4px 6px",
              "font-size": "12px",
              "font-family": "var(--oc-font-mono)",
              color: "var(--oc-text-primary)",
              background: "var(--oc-surface-primary)",
              border: "1px solid var(--oc-border-primary)",
              "border-radius": "var(--oc-radius-sm)",
              outline: "none",
              "text-align": "center",
            }}
          />
          <span style={{ "font-size": "12px", color: "var(--oc-text-tertiary)" }}>px</span>
        </div>
      </div>

      {/* Font family */}
      <div style={sectionStyle}>
        <Select
          label="Font Family"
          options={fontFamilyOptions}
          value={settings.appearance.fontFamily}
          onChange={(val) => updateSettings("appearance.fontFamily", val)}
        />
      </div>

      {/* Mono font family */}
      <div style={sectionStyle}>
        <Select
          label="Mono Font Family"
          options={monoFontOptions}
          value={settings.appearance.monoFontFamily}
          onChange={(val) => updateSettings("appearance.monoFontFamily", val)}
        />
      </div>

      {/* Toggles */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Notifications</div>
        <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
          <Switch
            checked={settings.notifications.enabled}
            onChange={(val) => updateSettings("notifications.enabled", val)}
            label="Enable Notifications"
          />
          <Switch
            checked={settings.notifications.sound}
            onChange={(val) => updateSettings("notifications.sound", val)}
            label="Enable Sound"
          />
        </div>
      </div>
    </div>
  )
}
