import { type Component, createSignal } from "solid-js"
import { Dialog } from "~/ui/components/dialog"
import { TextField } from "~/ui/components/text-field"
import { Button } from "~/ui/components/button"
import { useServer } from "~/context/server"
import { useModels } from "~/context/models"

export interface ConnectProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerId: string
  providerName: string
}

export const ConnectProviderDialog: Component<ConnectProviderDialogProps> = (props) => {
  const server = useServer()
  const models = useModels()

  const [apiKey, setApiKey] = createSignal("")
  const [baseUrl, setBaseUrl] = createSignal("")
  const [saving, setSaving] = createSignal(false)
  const [error, setError] = createSignal("")

  function handleClose() {
    setApiKey("")
    setBaseUrl("")
    setError("")
    props.onOpenChange(false)
  }

  async function handleSave() {
    const key = apiKey().trim()
    if (!key) {
      setError("API key is required")
      return
    }

    setSaving(true)
    setError("")

    try {
      const credentials: Record<string, string> = { apiKey: key }
      const url = baseUrl().trim()
      if (url) {
        credentials.baseUrl = url
      }
      await server.sdk.setAuth(props.providerId, credentials)
      await models.refresh()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save credentials")
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSave()
    }
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={handleClose}
      title={`Connect ${props.providerName}`}
      description={`Enter your API key to connect to ${props.providerName}.`}
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "16px" }}>
        <div>
          <label
            style={{
              display: "block",
              "font-size": "12px",
              "font-weight": "500",
              color: "var(--oc-text-secondary)",
              "margin-bottom": "4px",
            }}
          >
            API Key
          </label>
          <input
            type="password"
            value={apiKey()}
            onInput={(e) => setApiKey((e.currentTarget as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
            placeholder="sk-..."
            autocomplete="off"
            style={{
              width: "100%",
              padding: "8px 10px",
              "font-size": "13px",
              "font-family": "var(--oc-font-mono)",
              color: "var(--oc-text-primary)",
              background: "var(--oc-surface-primary)",
              border: `1px solid ${error() ? "var(--oc-error)" : "var(--oc-border-primary)"}`,
              "border-radius": "var(--oc-radius-md)",
              outline: "none",
              "box-sizing": "border-box",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--oc-border-focus)"
              ;(e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(91, 91, 230, 0.2)"
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = error() ? "var(--oc-error)" : "var(--oc-border-primary)"
              ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
            }}
          />
        </div>

        <TextField
          label="Base URL (optional)"
          value={baseUrl()}
          onInput={setBaseUrl}
          placeholder="https://api.example.com/v1"
        />

        {error() && (
          <div
            style={{
              "font-size": "12px",
              color: "var(--oc-error)",
              padding: "8px 10px",
              background: "var(--oc-surface-secondary)",
              "border-radius": "var(--oc-radius-sm)",
              border: "1px solid var(--oc-error)",
            }}
          >
            {error()}
          </div>
        )}

        <div style={{ display: "flex", "justify-content": "flex-end", gap: "8px", "margin-top": "8px" }}>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving()}>
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
