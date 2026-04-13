import { Tabs as KobalteTabs } from "@kobalte/core/tabs"
import { type JSX, type Component, splitProps, For } from "solid-js"

export interface TabItem {
  value: string
  label: string
  content: JSX.Element
}

export interface TabsProps {
  tabs: TabItem[]
  value?: string
  onChange?: (value: string) => void
  class?: string
}

export const Tabs: Component<TabsProps> = (props) => {
  const [local] = splitProps(props, ["tabs", "value", "onChange", "class"])

  return (
    <KobalteTabs
      class={local.class}
      value={local.value}
      onChange={local.onChange}
      style={{ display: "flex", "flex-direction": "column" }}
    >
      <KobalteTabs.List
        style={{
          display: "flex",
          "border-bottom": "1px solid var(--oc-border-primary)",
          gap: "0",
        }}
      >
        <For each={local.tabs}>
          {(tab) => (
            <KobalteTabs.Trigger
              value={tab.value}
              style={{
                padding: "8px 16px",
                "font-size": "13px",
                "font-family": "var(--oc-font-sans)",
                "font-weight": "500",
                color: "var(--oc-text-secondary)",
                background: "transparent",
                border: "none",
                "border-bottom": "2px solid transparent",
                cursor: "pointer",
                transition: "color 150ms ease, border-color 150ms ease",
                outline: "none",
              }}
              onMouseEnter={(e: MouseEvent) => {
                (e.currentTarget as HTMLElement).style.color = "var(--oc-text-primary)"
              }}
              onMouseLeave={(e: MouseEvent) => {
                const el = e.currentTarget as HTMLElement
                if (!el.getAttribute("data-selected")) {
                  el.style.color = "var(--oc-text-secondary)"
                }
              }}
            >
              {tab.label}
            </KobalteTabs.Trigger>
          )}
        </For>
        <KobalteTabs.Indicator
          style={{
            height: "2px",
            background: "var(--oc-accent-primary)",
            transition: "all 200ms ease",
            position: "absolute",
            bottom: "0",
          }}
        />
      </KobalteTabs.List>
      <For each={local.tabs}>
        {(tab) => (
          <KobalteTabs.Content
            value={tab.value}
            style={{ padding: "12px 0" }}
          >
            {tab.content}
          </KobalteTabs.Content>
        )}
      </For>
    </KobalteTabs>
  )
}
