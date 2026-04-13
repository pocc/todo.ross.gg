import { createContext, useContext, type ParentComponent } from "solid-js"
import { onMount } from "solid-js"
import { createStore, produce } from "solid-js/store"

type NotificationType = "info" | "success" | "warning" | "error"

interface NotificationItem {
  id: string
  title: string
  body: string
  type: NotificationType
  time: number
}

interface NotificationContextState {
  notifications: NotificationItem[]
  notify: (title: string, body: string, type?: NotificationType) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const NotificationContext = createContext<NotificationContextState>()

export const NotificationProvider: ParentComponent = (props) => {
  const [notifications, setNotifications] = createStore<NotificationItem[]>([])

  onMount(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        // permission request failed or denied
      })
    }
  })

  function notify(title: string, body: string, type: NotificationType = "info") {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const item: NotificationItem = { id, title, body, type, time: Date.now() }

    setNotifications(produce((arr) => {
      arr.push(item)
    }))

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(title, { body, tag: id })
      } catch {
        // browser notification failed (e.g., in non-secure context)
      }
    }
  }

  function dismiss(id: string) {
    setNotifications(produce((arr) => {
      const idx = arr.findIndex((n) => n.id === id)
      if (idx !== -1) arr.splice(idx, 1)
    }))
  }

  function dismissAll() {
    setNotifications([])
  }

  const state: NotificationContextState = {
    get notifications() {
      return notifications
    },
    notify,
    dismiss,
    dismissAll,
  }

  return (
    <NotificationContext.Provider value={state}>
      {props.children}
    </NotificationContext.Provider>
  )
}

export function useNotification(): NotificationContextState {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider")
  return ctx
}
