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
      for (const [key, value] of Object.entries(result.providers)) {
        parsed[key] = value as ProviderConfig
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
      if (config.models) {
        for (const m of config.models) {
          result.push({
            provider: providerKey,
            model: m.id,
            name: `${config.name} / ${m.name}`,
          })
        }
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
