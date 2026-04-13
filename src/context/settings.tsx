import { createContext, useContext, type ParentComponent } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { createEffect } from "solid-js"
import { persist } from "~/lib/persist"
import type { Settings } from "~/lib/types"

interface SettingsContextState {
  settings: Settings
  updateSettings: (path: string, value: unknown) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextState>()

const DEFAULT_SETTINGS: Settings = {
  appearance: {
    theme: "default",
    mode: "dark",
    fontSize: 14,
    fontFamily: "Inter",
    monoFontFamily: "JetBrains Mono",
  },
  keybinds: {
    "command.palette": "mod+k",
    "session.new": "mod+n",
    "session.close": "mod+w",
    "sidebar.toggle": "mod+b",
    "terminal.toggle": "mod+`",
    "message.send": "Enter",
    "message.newline": "shift+Enter",
    "message.abort": "Escape",
    "file.tree.toggle": "mod+shift+e",
    "review.panel.toggle": "mod+shift+d",
    "settings.open": "mod+,",
    "search.focus": "mod+f",
  },
  permissions: {
    autoAccept: false,
    ttl: 3600,
  },
  notifications: {
    enabled: true,
    sound: false,
  },
}

function deepSet(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".")
  let current: Record<string, unknown> = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }
  current[keys[keys.length - 1]] = value
}

export const SettingsProvider: ParentComponent = (props) => {
  const storage = persist<Settings>("settings.v3", DEFAULT_SETTINGS)
  const initial = storage.get()

  const merged: Settings = {
    appearance: { ...DEFAULT_SETTINGS.appearance, ...initial.appearance },
    keybinds: { ...DEFAULT_SETTINGS.keybinds, ...initial.keybinds },
    permissions: { ...DEFAULT_SETTINGS.permissions, ...initial.permissions },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...initial.notifications },
  }

  const [settings, setSettings] = createStore<Settings>(merged)

  createEffect(() => {
    storage.set({
      appearance: { ...settings.appearance },
      keybinds: { ...settings.keybinds },
      permissions: { ...settings.permissions },
      notifications: { ...settings.notifications },
    })
  })

  function updateSettings(path: string, value: unknown) {
    setSettings(
      produce((s) => {
        deepSet(s as unknown as Record<string, unknown>, path, value)
      })
    )
  }

  function resetSettings() {
    setSettings(
      produce((s) => {
        Object.assign(s.appearance, DEFAULT_SETTINGS.appearance)
        Object.assign(s.keybinds, DEFAULT_SETTINGS.keybinds)
        Object.assign(s.permissions, DEFAULT_SETTINGS.permissions)
        Object.assign(s.notifications, DEFAULT_SETTINGS.notifications)
      })
    )
  }

  const state: SettingsContextState = {
    get settings() {
      return settings
    },
    updateSettings,
    resetSettings,
  }

  return (
    <SettingsContext.Provider value={state}>
      {props.children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextState {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}
