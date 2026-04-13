import { type Component, splitProps, createEffect, createSignal, onMount } from "solid-js"
import { marked } from "marked"
import DOMPurify from "dompurify"
import morphdom from "morphdom"

export interface MarkdownProps {
  content: string
  streaming?: boolean
  class?: string
}

const copyButtonScript = `
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-copy-code]');
    if (!btn) return;
    var pre = btn.closest('pre');
    if (!pre) return;
    var code = pre.querySelector('code');
    if (!code) return;
    navigator.clipboard.writeText(code.textContent || '').then(function() {
      btn.textContent = 'Copied!';
      setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
    });
  });
`

function renderMarkdown(content: string): string {
  const raw = marked.parse(content, { async: false, gfm: true, breaks: true }) as string
  const clean = DOMPurify.sanitize(raw, {
    ADD_TAGS: ["button"],
    ADD_ATTR: ["data-copy-code"],
  })
  return clean
}

function addCopyButtons(html: string): string {
  return html.replace(
    /<pre>/g,
    `<pre style="position:relative;"><button data-copy-code style="position:absolute;top:6px;right:6px;padding:2px 8px;font-size:11px;background:var(--oc-surface-tertiary);color:var(--oc-text-secondary);border:1px solid var(--oc-border-primary);border-radius:var(--oc-radius-sm);cursor:pointer;font-family:var(--oc-font-sans);z-index:1;">Copy</button>`
  )
}

export const Markdown: Component<MarkdownProps> = (props) => {
  const [local] = splitProps(props, ["content", "streaming", "class"])
  let containerRef: HTMLDivElement | undefined
  const [initialized, setInitialized] = createSignal(false)

  onMount(() => {
    if (containerRef) {
      const script = document.createElement("script")
      script.textContent = copyButtonScript
      containerRef.appendChild(script)
      setInitialized(true)
    }
  })

  createEffect(() => {
    const content = local.content
    if (!containerRef || !initialized()) return

    const html = addCopyButtons(renderMarkdown(content))

    if (local.streaming) {
      const wrapper = document.createElement("div")
      wrapper.innerHTML = html
      morphdom(containerRef, wrapper, {
        childrenOnly: true,
        onBeforeElUpdated: (fromEl, toEl) => {
          if (fromEl.isEqualNode(toEl)) return false
          return true
        },
      })
    } else {
      containerRef.innerHTML = html
    }
  })

  return (
    <div
      ref={containerRef}
      class={local.class}
      style={{
        "font-size": "13px",
        "line-height": "1.65",
        color: "var(--oc-text-primary)",
        "word-break": "break-word",
        "overflow-wrap": "break-word",

        "--md-code-bg": "var(--oc-surface-secondary)",
        "--md-code-border": "var(--oc-border-primary)",
      }}
    >
      <style>{`
        .markdown-body p { margin: 0 0 0.75em; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body code {
          font-family: var(--oc-font-mono);
          font-size: 0.9em;
          background: var(--oc-surface-secondary);
          padding: 1px 5px;
          border-radius: var(--oc-radius-sm);
          border: 1px solid var(--oc-border-primary);
        }
        .markdown-body pre {
          background: var(--oc-surface-primary);
          border: 1px solid var(--oc-border-primary);
          border-radius: var(--oc-radius-md);
          padding: 12px;
          overflow-x: auto;
          margin: 0.75em 0;
        }
        .markdown-body pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 12px;
          line-height: 1.5;
        }
        .markdown-body ul, .markdown-body ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .markdown-body li { margin: 0.25em 0; }
        .markdown-body blockquote {
          border-left: 3px solid var(--oc-border-primary);
          padding-left: 12px;
          margin: 0.75em 0;
          color: var(--oc-text-secondary);
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3,
        .markdown-body h4, .markdown-body h5, .markdown-body h6 {
          font-weight: 600;
          margin: 1em 0 0.5em;
          line-height: 1.3;
        }
        .markdown-body h1 { font-size: 1.4em; }
        .markdown-body h2 { font-size: 1.2em; }
        .markdown-body h3 { font-size: 1.1em; }
        .markdown-body a { color: var(--oc-accent-primary); text-decoration: none; }
        .markdown-body a:hover { text-decoration: underline; }
        .markdown-body table {
          border-collapse: collapse;
          margin: 0.75em 0;
          width: 100%;
        }
        .markdown-body th, .markdown-body td {
          border: 1px solid var(--oc-border-primary);
          padding: 6px 10px;
          font-size: 12px;
        }
        .markdown-body th {
          background: var(--oc-surface-secondary);
          font-weight: 600;
        }
        .markdown-body hr {
          border: none;
          border-top: 1px solid var(--oc-border-primary);
          margin: 1em 0;
        }
        .markdown-body img { max-width: 100%; border-radius: var(--oc-radius-md); }
      `}</style>
    </div>
  )
}
