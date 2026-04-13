import { type Component, createSignal, Show } from "solid-js"
import { Dialog } from "~/ui/components/dialog"
import { Button } from "~/ui/components/button"
import { Select, type SelectOption } from "~/ui/components/select"
import { useServer } from "~/context/server"

export interface ForkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  messages?: Array<{ id: string; label: string }>
}

export const ForkDialog: Component<ForkDialogProps> = (props) => {
  const server = useServer()

  const [selectedMessage, setSelectedMessage] = createSignal("")
  const [forking, setForking] = createSignal(false)
  const [error, setError] = createSignal("")

  const messageOptions = (): SelectOption[] => {
    if (!props.messages || props.messages.length === 0) return []
    return [
      { value: "", label: "Current point (latest)" },
      ...props.messages.map((m) => ({
        value: m.id,
        label: m.label,
      })),
    ]
  }

  async function handleFork() {
    setForking(true)
    setError("")

    try {
      const data: { messageID?: string } = {}
      const msgId = selectedMessage()
      if (msgId) {
        data.messageID = msgId
      }
      await server.sdk.forkSession(props.sessionId, data)
      props.onOpenChange(false)
      setSelectedMessage("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fork session")
    } finally {
      setForking(false)
    }
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedMessage("")
          setError("")
        }
        props.onOpenChange(open)
      }}
      title="Fork Session"
      description="Create a new session branching from the current conversation."
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "16px" }}>
        <div
          style={{
            padding: "12px",
            background: "var(--oc-surface-secondary)",
            "border-radius": "var(--oc-radius-md)",
            "font-size": "13px",
            color: "var(--oc-text-secondary)",
            "line-height": "1.5",
          }}
        >
          Forking creates a new session that copies the conversation history up to the
          selected point. The original session remains unchanged.
        </div>

        <Show when={props.messages && props.messages.length > 0}>
          <Select
            label="Fork from message"
            options={messageOptions()}
            value={selectedMessage()}
            onChange={setSelectedMessage}
            placeholder="Select a message..."
          />
        </Show>

        <Show when={error()}>
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
        </Show>

        <div style={{ display: "flex", "justify-content": "flex-end", gap: "8px" }}>
          <Button variant="ghost" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleFork} loading={forking()}>
            Fork
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
