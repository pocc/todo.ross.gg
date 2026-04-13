import { type Component, For, Show, createSignal, createMemo } from "solid-js"

export interface FileTreeProps {
  files: string[]
  onFileSelect?: (path: string) => void
}

interface TreeNode {
  name: string
  path: string
  isDir: boolean
  children: TreeNode[]
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const filePath of paths) {
    const parts = filePath.split("/").filter(Boolean)
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]
      const isLast = i === parts.length - 1
      const partialPath = parts.slice(0, i + 1).join("/")

      let existing = current.find((n) => n.name === name)
      if (!existing) {
        existing = {
          name,
          path: partialPath,
          isDir: !isLast,
          children: [],
        }
        current.push(existing)
      } else if (!isLast && !existing.isDir) {
        existing.isDir = true
      }
      current = existing.children
    }
  }

  function sortNodes(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    for (const node of nodes) {
      sortNodes(node.children)
    }
  }

  sortNodes(root)
  return root
}

function getFileIcon(name: string): { color: string; letter: string } {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  switch (ext) {
    case "ts": case "tsx": return { color: "#3178c6", letter: "T" }
    case "js": case "jsx": return { color: "#f7df1e", letter: "J" }
    case "json": return { color: "#a8b1c2", letter: "{" }
    case "css": case "scss": case "less": return { color: "#563d7c", letter: "#" }
    case "html": return { color: "#e34c26", letter: "<" }
    case "md": case "mdx": return { color: "#519aba", letter: "M" }
    case "py": return { color: "#3776ab", letter: "P" }
    case "go": return { color: "#00add8", letter: "G" }
    case "rs": return { color: "#dea584", letter: "R" }
    case "yaml": case "yml": return { color: "#cb171e", letter: "Y" }
    case "toml": return { color: "#9c4121", letter: "T" }
    case "svg": case "png": case "jpg": case "gif": return { color: "#a074c4", letter: "I" }
    case "sh": case "bash": case "zsh": return { color: "#4eaa25", letter: "$" }
    case "lock": return { color: "#868e96", letter: "L" }
    default: return { color: "var(--oc-text-tertiary)", letter: "F" }
  }
}

const TreeNodeComponent: Component<{
  node: TreeNode
  depth: number
  onFileSelect?: (path: string) => void
}> = (props) => {
  const [expanded, setExpanded] = createSignal(props.depth < 2)

  const icon = () => getFileIcon(props.node.name)

  function handleClick() {
    if (props.node.isDir) {
      setExpanded((v) => !v)
    } else {
      props.onFileSelect?.(props.node.path)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        style={{
          display: "flex",
          "align-items": "center",
          gap: "4px",
          width: "100%",
          padding: `2px 6px 2px ${props.depth * 16 + 6}px`,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--oc-text-secondary)",
          "font-size": "12px",
          "font-family": "var(--oc-font-sans)",
          "text-align": "left",
          "border-radius": "var(--oc-radius-sm)",
          "line-height": "1.6",
          "white-space": "nowrap",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--oc-bg-hover)"
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent"
        }}
      >
        <Show
          when={props.node.isDir}
          fallback={
            <span
              style={{
                display: "inline-flex",
                "align-items": "center",
                "justify-content": "center",
                width: "14px",
                height: "14px",
                "font-size": "9px",
                "font-weight": "700",
                "font-family": "var(--oc-font-mono)",
                color: icon().color,
                "flex-shrink": "0",
              }}
            >
              {icon().letter}
            </span>
          }
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              "flex-shrink": "0",
              transform: expanded() ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 100ms ease",
              color: "var(--oc-text-tertiary)",
            }}
          >
            <path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </Show>

        <Show when={props.node.isDir}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ "flex-shrink": "0", color: "var(--oc-warning)" }}>
            <path
              d={expanded()
                ? "M1.5 4h11v7.5h-11z M1.5 4l1-2h4l1 2"
                : "M1.5 3.5h3.5l1.5 1.5h5.5v6.5h-10.5z"
              }
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill={expanded() ? "currentColor" : "none"}
              opacity={expanded() ? "0.2" : "1"}
            />
          </svg>
        </Show>

        <span
          style={{
            overflow: "hidden",
            "text-overflow": "ellipsis",
            color: props.node.isDir ? "var(--oc-text-primary)" : "var(--oc-text-secondary)",
          }}
        >
          {props.node.name}
        </span>
      </button>

      <Show when={props.node.isDir && expanded()}>
        <For each={props.node.children}>
          {(child) => (
            <TreeNodeComponent
              node={child}
              depth={props.depth + 1}
              onFileSelect={props.onFileSelect}
            />
          )}
        </For>
      </Show>
    </div>
  )
}

export const FileTree: Component<FileTreeProps> = (props) => {
  const tree = createMemo(() => buildTree(props.files))

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "font-family": "var(--oc-font-sans)",
        overflow: "auto",
        padding: "4px 0",
      }}
    >
      <Show
        when={tree().length > 0}
        fallback={
          <div
            style={{
              padding: "16px",
              "text-align": "center",
              "font-size": "12px",
              color: "var(--oc-text-tertiary)",
            }}
          >
            No files
          </div>
        }
      >
        <For each={tree()}>
          {(node) => (
            <TreeNodeComponent
              node={node}
              depth={0}
              onFileSelect={props.onFileSelect}
            />
          )}
        </For>
      </Show>
    </div>
  )
}
