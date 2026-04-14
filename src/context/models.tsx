import { createContext, useContext, type ParentComponent } from "solid-js"
import { createSignal, onMount } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { useServer } from "~/context/server"
import type { ProviderConfig } from "~/lib/types"

interface ModelsContextState {
  providers: Record<string, ProviderConfig>
  selectedModel: () => string | null
  selectedProvider: () => string | null
  selectModel: (provider: string, model: string) => void
  getAvailableModels: () => Array<{ provider: string; model: string; name: string }>
  refresh: () => Promise<void>
}

const ModelsContext = createContext<ModelsContextState>()

export const ModelsProvider: ParentComponent = (props) => {
  const server = useServer()

  const [providers, setProviders] = createStore<Record<string, ProviderConfig>>({})
  const [selectedModel, setSelectedModel] = createSignal<string | null>(null)
  const [selectedProvider, setSelectedProvider] = createSignal<string | null>(null)

  async function fetchProviders() {
    try {
      const result = await server.sdk.getProviders()
      const parsed: Record<string, ProviderConfig> = {}

      // API may return providers as an array or object
      const entries = Array.isArray(result.providers)
        ? result.providers.map((p: any) => [p.id, p] as const)
        : Object.entries(result.providers)

      for (const [key, value] of entries) {
        const raw = value as any
        // API returns models as an object keyed by ID; normalize to array
        const modelsRaw = raw.models
        const modelsArray = Array.isArray(modelsRaw)
          ? modelsRaw
          : modelsRaw && typeof modelsRaw === "object"
            ? Object.values(modelsRaw).map((m: any) => ({ id: m.id, name: m.name }))
            : []
        parsed[key as string] = {
          id: raw.id ?? (key as string),
          name: raw.name ?? (key as string),
          api: raw.api,
          models: modelsArray,
        }
      }
      setProviders(reconcile(parsed))
    } catch {
      // provider fetch failed
    }
  }

  function selectModel(provider: string, model: string) {
    setSelectedProvider(provider)
    setSelectedModel(model)
  }

  function getAvailableModels(): Array<{ provider: string; model: string; name: string }> {
    const result: Array<{ provider: string; model: string; name: string }> = []
    for (const [providerKey, config] of Object.entries(providers)) {
      const models = Array.isArray(config.models) ? config.models : []
      for (const m of models) {
        result.push({
          provider: providerKey,
          model: m.id,
          name: `${config.name} / ${m.name}`,
        })
      }
    }
    return result
  }

  onMount(() => {
    fetchProviders()
  })

  const state: ModelsContextState = {
    get providers() {
      return providers
    },
    selectedModel,
    selectedProvider,
    selectModel,
    getAvailableModels,
    refresh: fetchProviders,
  }

  return (
    <ModelsContext.Provider value={state}>
      {props.children}
    </ModelsContext.Provider>
  )
}

export function useModels(): ModelsContextState {
  const ctx = useContext(ModelsContext)
  if (!ctx) throw new Error("useModels must be used within ModelsProvider")
  return ctx
}
