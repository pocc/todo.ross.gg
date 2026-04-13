import { type Component, For, Show, createSignal } from "solid-js"
import { useModels } from "~/context/models"
import { useGlobalSync } from "~/context/global-sync"
import { Button } from "~/ui/components/button"
import { ConnectProviderDialog } from "~/components/dialog-connect-provider"
import { useServer } from "~/context/server"

export const SettingsProviders: Component = () => {
  const models = useModels()
  const globalSync = useGlobalSync()
  const server = useServer()

  const [connectOpen, setConnectOpen] = createSignal(false)
  const [connectProviderId, setConnectProviderId] = createSignal("")
  const [connectProviderName, setConnectProviderName] = createSignal("")
  const [disconnecting, setDisconnecting] = createSignal<string | null>(null)

  const providerEntries = () => Object.entries(models.providers)

  function handleConnect(id: string, name: string) {
    setConnectProviderId(id)
    setConnectProviderName(name)
    setConnectOpen(true)
  }

  async function handleDisconnect(id: string) {
    setDisconnecting(id)
    try {
      await server.sdk.removeAuth(id)
      await models.refresh()
    } catch {
      // disconnect failed
    } finally {
      setDisconnecting(null)
    }
  }

  function isAuthenticated(id: string): boolean {
    return globalSync.auth[id] ?? false
  }

  return (
    <div>
      <div
        style={{
          "font-size": "13px",
          "font-weight": "600",
          color: "var(--oc-text-primary)",
          "margin-bottom": "16px",
        }}
      >
        Providers
      </div>

      <Show
        when={providerEntries().length > 0}
        fallback={
          <div
            style={{
              "font-size": "13px",
              color: "var(--oc-text-tertiary)",
              padding: "24px 0",
              "text-align": "center",
            }}
          >
            No providers available.
          </div>
        }
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
          <For each={providerEntries()}>
            {([id, provider]) => {
              const authenticated = () => isAuthenticated(id)
              return (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "space-between",
                    padding: "12px 14px",
                    background: "var(--oc-surface-secondary)",
                    border: "1px solid var(--oc-border-primary)",
                    "border-radius": "var(--oc-radius-md)",
                  }}
                >
                  <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        "border-radius": "50%",
                        background: authenticated() ? "var(--oc-success)" : "var(--oc-text-tertiary)",
                        "flex-shrink": "0",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          "font-size": "13px",
                          "font-weight": "500",
                          color: "var(--oc-text-primary)",
                        }}
                      >
                        {provider.name}
                      </div>
                      <div
                        style={{
                          "font-size": "11px",
                          color: "var(--oc-text-tertiary)",
                          "margin-top": "2px",
                        }}
                      >
                        {authenticated() ? "Connected" : "Not connected"}
                        {provider.api ? ` - ${provider.api}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Show
                      when={authenticated()}
                      fallback={
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleConnect(id, provider.name)}
                        >
                          Connect
                        </Button>
                      }
                    >
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDisconnect(id)}
                        loading={disconnecting() === id}
                      >
                        Disconnect
                      </Button>
                    </Show>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
      </Show>

      <ConnectProviderDialog
        open={connectOpen()}
        onOpenChange={setConnectOpen}
        providerId={connectProviderId()}
        providerName={connectProviderName()}
      />
    </div>
  )
}
