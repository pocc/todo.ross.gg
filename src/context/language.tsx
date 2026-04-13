import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal } from "solid-js"

type Locale = "en" | "zh"

interface LanguageContextState {
  locale: () => Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextState>()

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "session": "Session",
    "sessions": "Sessions",
    "settings": "Settings",
    "new": "New",
    "delete": "Delete",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "send": "Send",
    "abort": "Abort",
    "search": "Search",
    "close": "Close",
    "open": "Open",
    "save": "Save",
    "copy": "Copy",
    "copied": "Copied",
    "loading": "Loading",
    "error": "Error",
    "retry": "Retry",
    "model": "Model",
    "provider": "Provider",
    "terminal": "Terminal",
    "files": "Files",
    "diff": "Diff",
    "todos": "Todos",
    "permissions": "Permissions",
    "accept": "Accept",
    "reject": "Reject",
    "notifications": "Notifications",
    "appearance": "Appearance",
    "theme": "Theme",
    "dark": "Dark",
    "light": "Light",
    "system": "System",
    "font.size": "Font Size",
    "command.palette": "Command Palette",
    "no.sessions": "No sessions",
    "new.session": "New Session",
    "delete.session": "Delete Session",
    "share": "Share",
    "fork": "Fork",
  },
  zh: {
    "session": "\u4F1A\u8BDD",
    "sessions": "\u4F1A\u8BDD",
    "settings": "\u8BBE\u7F6E",
    "new": "\u65B0\u5EFA",
    "delete": "\u5220\u9664",
    "cancel": "\u53D6\u6D88",
    "confirm": "\u786E\u8BA4",
    "send": "\u53D1\u9001",
    "abort": "\u4E2D\u6B62",
    "search": "\u641C\u7D22",
    "close": "\u5173\u95ED",
    "open": "\u6253\u5F00",
    "save": "\u4FDD\u5B58",
    "copy": "\u590D\u5236",
    "copied": "\u5DF2\u590D\u5236",
    "loading": "\u52A0\u8F7D\u4E2D",
    "error": "\u9519\u8BEF",
    "retry": "\u91CD\u8BD5",
    "model": "\u6A21\u578B",
    "provider": "\u63D0\u4F9B\u8005",
    "terminal": "\u7EC8\u7AEF",
    "files": "\u6587\u4EF6",
    "diff": "\u5DEE\u5F02",
    "todos": "\u5F85\u529E",
    "permissions": "\u6743\u9650",
    "accept": "\u63A5\u53D7",
    "reject": "\u62D2\u7EDD",
    "notifications": "\u901A\u77E5",
    "appearance": "\u5916\u89C2",
    "theme": "\u4E3B\u9898",
    "dark": "\u6DF1\u8272",
    "light": "\u6D45\u8272",
    "system": "\u7CFB\u7EDF",
    "font.size": "\u5B57\u4F53\u5927\u5C0F",
    "command.palette": "\u547D\u4EE4\u9762\u677F",
    "no.sessions": "\u6CA1\u6709\u4F1A\u8BDD",
    "new.session": "\u65B0\u4F1A\u8BDD",
    "delete.session": "\u5220\u9664\u4F1A\u8BDD",
    "share": "\u5206\u4EAB",
    "fork": "\u590D\u5236\u5206\u652F",
  },
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en"
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith("zh")) return "zh"
  return "en"
}

export const LanguageProvider: ParentComponent = (props) => {
  const [locale, setLocale] = createSignal<Locale>(detectLocale())

  function t(key: string): string {
    const dict = translations[locale()]
    return dict[key] ?? translations.en[key] ?? key
  }

  const state: LanguageContextState = {
    locale,
    setLocale,
    t,
  }

  return (
    <LanguageContext.Provider value={state}>
      {props.children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextState {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
