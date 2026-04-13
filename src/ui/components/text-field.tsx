import { TextField as KobalteTextField } from "@kobalte/core/text-field"
import { type JSX, type Component, splitProps, Show } from "solid-js"

export interface TextFieldProps {
  value?: string
  onInput?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  multiline?: boolean
  rows?: number
  onKeyDown?: JSX.EventHandlerUnion<HTMLInputElement | HTMLTextAreaElement, KeyboardEvent>
  class?: string
}

const baseInputStyle: JSX.CSSProperties = {
  width: "100%",
  background: "var(--oc-surface-primary)",
  color: "var(--oc-text-primary)",
  border: "1px solid var(--oc-border-primary)",
  "border-radius": "var(--oc-radius-md)",
  padding: "6px 10px",
  "font-family": "var(--oc-font-sans)",
  "font-size": "13px",
  outline: "none",
  transition: "border-color 150ms ease, box-shadow 150ms ease",
  resize: "vertical",
}

export const TextField: Component<TextFieldProps> = (props) => {
  const [local] = splitProps(props, [
    "value",
    "onInput",
    "placeholder",
    "label",
    "error",
    "disabled",
    "multiline",
    "rows",
    "onKeyDown",
    "class",
  ])

  const handleFocus = (e: FocusEvent) => {
    const t = e.currentTarget as HTMLElement
    t.style.borderColor = "var(--oc-border-focus)"
    t.style.boxShadow = "0 0 0 2px rgba(91, 91, 230, 0.2)"
  }

  const handleBlur = (e: FocusEvent) => {
    const t = e.currentTarget as HTMLElement
    t.style.borderColor = local.error ? "var(--oc-error)" : "var(--oc-border-primary)"
    t.style.boxShadow = "none"
  }

  return (
    <KobalteTextField
      class={local.class}
      value={local.value}
      onChange={local.onInput}
      disabled={local.disabled}
      validationState={local.error ? "invalid" : "valid"}
      style={{ display: "flex", "flex-direction": "column", gap: "4px" }}
    >
      <Show when={local.label}>
        <KobalteTextField.Label
          style={{
            "font-size": "12px",
            "font-weight": "500",
            color: "var(--oc-text-secondary)",
          }}
        >
          {local.label}
        </KobalteTextField.Label>
      </Show>
      <Show
        when={local.multiline}
        fallback={
          <KobalteTextField.Input
            placeholder={local.placeholder}
            onKeyDown={local.onKeyDown as JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent>}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              ...baseInputStyle,
              "border-color": local.error ? "var(--oc-error)" : "var(--oc-border-primary)",
            }}
          />
        }
      >
        <KobalteTextField.TextArea
          placeholder={local.placeholder}
          rows={local.rows ?? 3}
          onKeyDown={local.onKeyDown as JSX.EventHandlerUnion<HTMLTextAreaElement, KeyboardEvent>}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            ...baseInputStyle,
            "border-color": local.error ? "var(--oc-error)" : "var(--oc-border-primary)",
          }}
        />
      </Show>
      <Show when={local.error}>
        <KobalteTextField.ErrorMessage
          style={{ "font-size": "11px", color: "var(--oc-error)" }}
        >
          {local.error}
        </KobalteTextField.ErrorMessage>
      </Show>
    </KobalteTextField>
  )
}
