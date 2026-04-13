import { Accordion as KobalteAccordion } from "@kobalte/core/accordion"
import { type JSX, type Component, splitProps, For } from "solid-js"

export interface AccordionItem {
  value: string
  title: string
  content: JSX.Element
}

export interface AccordionProps {
  items: AccordionItem[]
  multiple?: boolean
  defaultValue?: string[]
  class?: string
}

export const Accordion: Component<AccordionProps> = (props) => {
  const [local] = splitProps(props, ["items", "multiple", "defaultValue", "class"])

  return (
    <KobalteAccordion
      class={local.class}
      multiple={local.multiple}
      defaultValue={local.defaultValue}
      style={{ "border-radius": "var(--oc-radius-md)", overflow: "hidden" }}
    >
      <For each={local.items}>
        {(item) => (
          <KobalteAccordion.Item
            value={item.value}
            style={{ "border-bottom": "1px solid var(--oc-border-primary)" }}
          >
            <KobalteAccordion.Header>
              <KobalteAccordion.Trigger
                style={{
                  width: "100%",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "space-between",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  "font-size": "13px",
                  "font-weight": "500",
                  "font-family": "var(--oc-font-sans)",
                  color: "var(--oc-text-primary)",
                  cursor: "pointer",
                  outline: "none",
                  transition: "background 100ms ease",
                }}
                onMouseEnter={(e: MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
                }}
                onMouseLeave={(e: MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent"
                }}
              >
                {item.title}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: "transform 200ms ease", "flex-shrink": "0" }}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </KobalteAccordion.Trigger>
            </KobalteAccordion.Header>
            <KobalteAccordion.Content
              style={{
                padding: "0 12px 10px",
                "font-size": "13px",
                color: "var(--oc-text-secondary)",
                overflow: "hidden",
                animation: "oc-accordion-open 200ms ease",
              }}
            >
              <style>{`@keyframes oc-accordion-open { from { height: 0; opacity: 0; } to { height: var(--kb-accordion-content-height); opacity: 1; } }`}</style>
              {item.content}
            </KobalteAccordion.Content>
          </KobalteAccordion.Item>
        )}
      </For>
    </KobalteAccordion>
  )
}
