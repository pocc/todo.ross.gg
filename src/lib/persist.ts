export function persist<T>(key: string, defaultValue: T): {
  get: () => T
  set: (value: T) => void
  update: (fn: (current: T) => T) => void
  clear: () => void
} {
  return {
    get() {
      try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : defaultValue
      } catch {
        return defaultValue
      }
    },
    set(value: T) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Storage full or unavailable
      }
    },
    update(fn: (current: T) => T) {
      this.set(fn(this.get()))
    },
    clear() {
      localStorage.removeItem(key)
    },
  }
}

export function createLRUCache<T>(key: string, maxSize: number) {
  const store = persist<Record<string, { value: T; ts: number }>>(key, {})

  return {
    get(id: string): T | undefined {
      const data = store.get()
      return data[id]?.value
    },
    set(id: string, value: T) {
      store.update((data) => {
        data[id] = { value, ts: Date.now() }
        const entries = Object.entries(data)
        if (entries.length > maxSize) {
          entries.sort((a, b) => a[1].ts - b[1].ts)
          const toRemove = entries.slice(0, entries.length - maxSize)
          for (const [k] of toRemove) delete data[k]
        }
        return data
      })
    },
    remove(id: string) {
      store.update((data) => {
        delete data[id]
        return data
      })
    },
    clear() {
      store.clear()
    },
  }
}
