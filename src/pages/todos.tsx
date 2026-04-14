import { Component, createSignal, createEffect, onMount, onCleanup } from "solid-js"
import { useParams } from "@solidjs/router"
import { persist } from "~/lib/persist"

const DEFAULT_CONTENT = `# Todos

- [ ] First task
- [ ] Second task
- [ ] Third task
`

// Render a single line of markdown to HTML
function renderLine(line: string, lineIndex: number): string {
  // Heading
  const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
  if (headingMatch) {
    const level = headingMatch[1].length
    const sizes: Record<number, string> = { 1: "1.5em", 2: "1.3em", 3: "1.15em", 4: "1.05em", 5: "1em", 6: "0.95em" }
    const content = renderInline(headingMatch[2])
    return `<div data-line="${lineIndex}" style="font-size:${sizes[level] || "1em"};font-weight:600;margin:0.4em 0 0.2em;line-height:1.4;">${content}</div>`
  }

  // Task list item: - [ ] or - [x]
  const taskMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/)
  if (taskMatch) {
    const indent = taskMatch[1].length
    const checked = taskMatch[2] !== " "
    const content = renderInline(taskMatch[3])
    const paddingLeft = indent * 16 + 4
    return `<div data-line="${lineIndex}" style="display:flex;align-items:flex-start;gap:8px;padding:2px 0 2px ${paddingLeft}px;line-height:1.6;">` +
      `<input type="checkbox" data-task-line="${lineIndex}" ${checked ? "checked" : ""} style="margin-top:5px;cursor:pointer;accent-color:var(--oc-accent-primary);flex-shrink:0;" />` +
      `<span style="${checked ? "text-decoration:line-through;opacity:0.5;" : ""}">${content}</span>` +
      `</div>`
  }

  // Unordered list item: - or *
  const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/)
  if (ulMatch) {
    const indent = ulMatch[1].length
    const content = renderInline(ulMatch[2])
    const paddingLeft = indent * 16 + 4
    return `<div data-line="${lineIndex}" style="padding:2px 0 2px ${paddingLeft}px;line-height:1.6;">` +
      `<span style="margin-right:8px;opacity:0.4;">\u2022</span>${content}</div>`
  }

  // Ordered list item: 1.
  const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/)
  if (olMatch) {
    const indent = olMatch[1].length
    const num = olMatch[2]
    const content = renderInline(olMatch[3])
    const paddingLeft = indent * 16 + 4
    return `<div data-line="${lineIndex}" style="padding:2px 0 2px ${paddingLeft}px;line-height:1.6;">` +
      `<span style="margin-right:8px;opacity:0.5;font-size:0.9em;">${num}.</span>${content}</div>`
  }

  // Blockquote
  const bqMatch = line.match(/^>\s*(.*)$/)
  if (bqMatch) {
    const content = renderInline(bqMatch[1])
    return `<div data-line="${lineIndex}" style="border-left:3px solid var(--oc-border-primary);padding-left:12px;color:var(--oc-text-secondary);line-height:1.6;margin:2px 0;">${content}</div>`
  }

  // Horizontal rule
  if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
    return `<hr data-line="${lineIndex}" style="border:none;border-top:1px solid var(--oc-border-primary);margin:8px 0;" />`
  }

  // Empty line
  if (line.trim() === "") {
    return `<div data-line="${lineIndex}" style="height:0.6em;">\u200b</div>`
  }

  // Plain paragraph
  return `<div data-line="${lineIndex}" style="padding:2px 0;line-height:1.6;">${renderInline(line)}</div>`
}

// Render inline markdown (bold, italic, code, links, strikethrough)
function renderInline(text: string): string {
  let result = escapeHtml(text)

  // Code (backtick) — process first to avoid nesting
  result = result.replace(/`([^`]+)`/g,
    '<code style="font-family:var(--oc-font-mono);font-size:0.9em;background:var(--oc-surface-secondary);padding:1px 5px;border-radius:3px;border:1px solid var(--oc-border-primary);">$1</code>')

  // Bold + italic
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')

  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Strikethrough
  result = result.replace(/~~(.+?)~~/g, '<s style="opacity:0.5;">$1</s>')

  // Links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" style="color:var(--oc-accent-primary);text-decoration:none;">$1</a>')

  return result
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderMarkdownToHtml(source: string): string {
  const lines = source.split("\n")
  return lines.map((line, i) => renderLine(line, i)).join("")
}

// Get caret offset as character position within a contenteditable
function getCaretOffset(el: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return 0
  const range = sel.getRangeAt(0)
  const preRange = document.createRange()
  preRange.selectNodeContents(el)
  preRange.setEnd(range.startContainer, range.startOffset)
  return preRange.toString().length
}

// Restore caret to a character offset within a contenteditable
function setCaretOffset(el: HTMLElement, offset: number) {
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()

  let current = 0
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let node: Text | null = null

  while ((node = walker.nextNode() as Text | null)) {
    const len = node.textContent?.length ?? 0
    if (current + len >= offset) {
      range.setStart(node, offset - current)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
      return
    }
    current += len
  }

  // If offset exceeds content, place at end
  range.selectNodeContents(el)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

// Extract raw text from contenteditable HTML, mapping back to markdown lines
function extractTextFromEditable(el: HTMLElement): string {
  const lines: string[] = []
  const children = el.querySelectorAll("[data-line]")
  if (children.length === 0) {
    // Fallback: plain text extraction
    return el.textContent || ""
  }
  children.forEach((child) => {
    // For task items with checkboxes, reconstruct the markdown
    const checkbox = child.querySelector("input[type='checkbox']") as HTMLInputElement | null
    if (checkbox !== null) {
      const lineIdx = parseInt(child.getAttribute("data-line") || "0")
      // We'll use the original source line structure, just update text
    }
    lines.push(child.textContent || "")
  })
  return lines.join("\n")
}

export const TodosPage: Component = () => {
  const params = useParams<{ dir: string }>()

  const storageKey = () => `todos.${params.dir}`
  const [source, setSource] = createSignal("")

  let editorRef: HTMLDivElement | undefined
  let isComposing = false
  let skipNextInput = false
  let saveTimeout: ReturnType<typeof setTimeout> | undefined

  // Load content on mount / directory change
  createEffect(() => {
    const key = storageKey()
    const storage = persist<string>(key, DEFAULT_CONTENT)
    setSource(storage.get())
  })

  // Save to localStorage (debounced)
  function saveContent(content: string) {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      const storage = persist<string>(storageKey(), DEFAULT_CONTENT)
      storage.set(content)
    }, 300)
  }

  // Sync rendered HTML when source changes (but not during active editing)
  let renderScheduled = false

  function scheduleRender() {
    if (renderScheduled) return
    renderScheduled = true
    requestAnimationFrame(() => {
      renderScheduled = false
      if (!editorRef) return
      const caretPos = getCaretOffset(editorRef)
      editorRef.innerHTML = renderMarkdownToHtml(source())
      setCaretOffset(editorRef, caretPos)
    })
  }

  onMount(() => {
    if (editorRef) {
      editorRef.innerHTML = renderMarkdownToHtml(source())
    }
  })

  // Re-render when source changes externally (e.g., checkbox toggle)
  createEffect(() => {
    const _ = source()
    if (editorRef) {
      scheduleRender()
    }
  })

  onCleanup(() => {
    clearTimeout(saveTimeout)
  })

  // Reconstruct markdown source from the editor's current state
  function reconstructSource(): string {
    if (!editorRef) return source()

    const lines = source().split("\n")
    const lineElements = editorRef.querySelectorAll("[data-line]")
    const newLines: string[] = []

    lineElements.forEach((el) => {
      const lineIdx = parseInt(el.getAttribute("data-line") || "0")
      const origLine = lines[lineIdx] ?? ""

      // Task list item — preserve markdown structure
      const taskMatch = origLine.match(/^(\s*-\s*\[[ xX]\]\s*)/)
      if (taskMatch) {
        const checkbox = el.querySelector("input[type='checkbox']") as HTMLInputElement | null
        const checked = checkbox?.checked ?? false
        const indent = origLine.match(/^(\s*)/)?.[1] ?? ""
        const textSpan = el.querySelector("span")
        const text = textSpan?.textContent ?? ""
        newLines.push(`${indent}- [${checked ? "x" : " "}] ${text}`)
        return
      }

      // Heading — preserve #
      const headingMatch = origLine.match(/^(#{1,6})\s+/)
      if (headingMatch) {
        const text = el.textContent ?? ""
        newLines.push(`${headingMatch[1]} ${text}`)
        return
      }

      // Unordered list — preserve - prefix
      const ulMatch = origLine.match(/^(\s*)[-*]\s+/)
      if (ulMatch) {
        // Get text after bullet
        const text = el.textContent?.replace(/^\u2022\s*/, "") ?? ""
        newLines.push(`${ulMatch[1]}- ${text}`)
        return
      }

      // Ordered list — preserve number
      const olMatch = origLine.match(/^(\s*)(\d+)\.\s+/)
      if (olMatch) {
        const text = el.textContent?.replace(/^\d+\.\s*/, "") ?? ""
        newLines.push(`${olMatch[1]}${olMatch[2]}. ${text}`)
        return
      }

      // Blockquote
      if (origLine.match(/^>\s*/)) {
        newLines.push(`> ${el.textContent ?? ""}`)
        return
      }

      // HR
      if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(origLine)) {
        newLines.push(origLine)
        return
      }

      // Empty line
      if (origLine.trim() === "" && (el.textContent ?? "").trim() === "") {
        newLines.push("")
        return
      }

      // Plain text — use as-is
      newLines.push(el.textContent ?? "")
    })

    return newLines.join("\n")
  }

  function handleInput() {
    if (isComposing || skipNextInput) {
      skipNextInput = false
      return
    }
    const newSource = reconstructSource()
    setSource(newSource)
    saveContent(newSource)
  }

  function handleCompositionStart() {
    isComposing = true
  }

  function handleCompositionEnd() {
    isComposing = false
    handleInput()
  }

  function handleCheckboxClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === "INPUT" && target.getAttribute("type") === "checkbox") {
      const lineIdx = parseInt(target.getAttribute("data-task-line") || "-1")
      if (lineIdx < 0) return

      // Toggle in source
      const lines = source().split("\n")
      if (lineIdx < lines.length) {
        const line = lines[lineIdx]
        if (/- \[ \]/.test(line)) {
          lines[lineIdx] = line.replace("- [ ]", "- [x]")
        } else if (/- \[x\]/i.test(line)) {
          lines[lineIdx] = line.replace(/- \[x\]/i, "- [ ]")
        }
        const newSource = lines.join("\n")
        skipNextInput = true
        setSource(newSource)
        saveContent(newSource)
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return

      // Find which line we're on
      let node: Node | null = sel.anchorNode
      let lineEl: HTMLElement | null = null
      while (node && node !== editorRef) {
        if (node instanceof HTMLElement && node.hasAttribute("data-line")) {
          lineEl = node
          break
        }
        node = node.parentNode
      }

      const lineIdx = lineEl ? parseInt(lineEl.getAttribute("data-line") || "0") : -1
      const lines = source().split("\n")

      // Determine prefix for new line
      let prefix = ""
      if (lineIdx >= 0 && lineIdx < lines.length) {
        const currentLine = lines[lineIdx]
        const taskMatch = currentLine.match(/^(\s*)-\s*\[[ xX]\]\s*/)
        const ulMatch = currentLine.match(/^(\s*)[-*]\s+/)
        const olMatch = currentLine.match(/^(\s*)(\d+)\.\s+/)

        if (taskMatch) {
          prefix = `${taskMatch[1]}- [ ] `
        } else if (olMatch) {
          prefix = `${olMatch[1]}${parseInt(olMatch[2]) + 1}. `
        } else if (ulMatch) {
          prefix = `${ulMatch[1]}- `
        }
      }

      // Insert new line after current
      const insertIdx = lineIdx >= 0 ? lineIdx + 1 : lines.length
      lines.splice(insertIdx, 0, prefix)
      const newSource = lines.join("\n")
      setSource(newSource)
      saveContent(newSource)

      // After render, position caret at end of the new line
      requestAnimationFrame(() => {
        if (!editorRef) return
        const newLineEl = editorRef.querySelector(`[data-line="${insertIdx}"]`)
        if (newLineEl) {
          const range = document.createRange()
          const sel = window.getSelection()
          // Find last text node in the new line element
          const walker = document.createTreeWalker(newLineEl, NodeFilter.SHOW_TEXT)
          let lastText: Text | null = null
          let textNode: Text | null
          while ((textNode = walker.nextNode() as Text | null)) {
            lastText = textNode
          }
          if (lastText) {
            range.setStart(lastText, lastText.textContent?.length ?? 0)
            range.collapse(true)
          } else {
            range.selectNodeContents(newLineEl)
            range.collapse(false)
          }
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
      })
    }

    // Tab to indent
    if (e.key === "Tab") {
      e.preventDefault()
      let node: Node | null = window.getSelection()?.anchorNode ?? null
      let lineEl: HTMLElement | null = null
      while (node && node !== editorRef) {
        if (node instanceof HTMLElement && node.hasAttribute("data-line")) {
          lineEl = node
          break
        }
        node = node.parentNode
      }
      const lineIdx = lineEl ? parseInt(lineEl.getAttribute("data-line") || "0") : -1
      if (lineIdx >= 0) {
        const lines = source().split("\n")
        if (e.shiftKey) {
          // Unindent
          lines[lineIdx] = lines[lineIdx].replace(/^  /, "")
        } else {
          // Indent
          lines[lineIdx] = "  " + lines[lineIdx]
        }
        const newSource = lines.join("\n")
        setSource(newSource)
        saveContent(newSource)
      }
    }

    // Backspace at start of list line removes the prefix
    if (e.key === "Backspace") {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return

      let node: Node | null = sel.anchorNode
      let lineEl: HTMLElement | null = null
      while (node && node !== editorRef) {
        if (node instanceof HTMLElement && node.hasAttribute("data-line")) {
          lineEl = node
          break
        }
        node = node.parentNode
      }

      const lineIdx = lineEl ? parseInt(lineEl.getAttribute("data-line") || "0") : -1
      if (lineIdx >= 0) {
        const lines = source().split("\n")
        const line = lines[lineIdx]

        // Check if we're at start of the text content (caret at beginning)
        const caretInLine = (() => {
          if (!lineEl) return 0
          const range = sel.getRangeAt(0)
          const preRange = document.createRange()
          preRange.selectNodeContents(lineEl)
          preRange.setEnd(range.startContainer, range.startOffset)
          return preRange.toString().length
        })()

        if (caretInLine === 0) {
          // Remove list prefix
          const taskMatch = line.match(/^(\s*)-\s*\[[ xX]\]\s*(.*)$/)
          const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/)
          const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/)

          if (taskMatch) {
            e.preventDefault()
            lines[lineIdx] = taskMatch[2]
            const newSource = lines.join("\n")
            setSource(newSource)
            saveContent(newSource)
          } else if (ulMatch) {
            e.preventDefault()
            lines[lineIdx] = ulMatch[2]
            const newSource = lines.join("\n")
            setSource(newSource)
            saveContent(newSource)
          } else if (olMatch) {
            e.preventDefault()
            lines[lineIdx] = olMatch[2]
            const newSource = lines.join("\n")
            setSource(newSource)
            saveContent(newSource)
          } else if (lineIdx > 0 && line === "") {
            // Merge with previous line
            e.preventDefault()
            lines.splice(lineIdx, 1)
            const newSource = lines.join("\n")
            setSource(newSource)
            saveContent(newSource)
          }
        }
      }
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData?.getData("text/plain") ?? ""
    if (!text) return

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    // Find current line
    let node: Node | null = sel.anchorNode
    let lineEl: HTMLElement | null = null
    while (node && node !== editorRef) {
      if (node instanceof HTMLElement && node.hasAttribute("data-line")) {
        lineEl = node
        break
      }
      node = node.parentNode
    }

    const lineIdx = lineEl ? parseInt(lineEl.getAttribute("data-line") || "0") : 0
    const lines = source().split("\n")
    const pasteLines = text.split("\n")

    if (pasteLines.length === 1) {
      // Single line paste — insert into current line
      const caretInLine = (() => {
        if (!lineEl) return 0
        const range = sel.getRangeAt(0)
        const preRange = document.createRange()
        preRange.selectNodeContents(lineEl)
        preRange.setEnd(range.startContainer, range.startOffset)
        return preRange.toString().length
      })()

      const currentText = lineEl?.textContent ?? ""
      const before = currentText.slice(0, caretInLine)
      const after = currentText.slice(caretInLine)

      // Reconstruct the line with the pasted text
      const origLine = lines[lineIdx] ?? ""
      const prefixMatch = origLine.match(/^(\s*(?:-\s*\[[ xX]\]\s*|-\s+|\*\s+|\d+\.\s+|>\s*)?)/)
      const prefix = prefixMatch?.[1] ?? ""
      lines[lineIdx] = prefix + before + text + after
    } else {
      // Multi-line paste — splice in
      lines.splice(lineIdx + 1, 0, ...pasteLines.slice(1))
      // Append first line of paste to current line
      const currentText = lineEl?.textContent ?? ""
      const origLine = lines[lineIdx] ?? ""
      const prefixMatch = origLine.match(/^(\s*(?:-\s*\[[ xX]\]\s*|-\s+|\*\s+|\d+\.\s+|>\s*)?)/)
      const prefix = prefixMatch?.[1] ?? ""
      lines[lineIdx] = prefix + currentText + pasteLines[0]
    }

    const newSource = lines.join("\n")
    setSource(newSource)
    saveContent(newSource)
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        overflow: "auto",
        background: "var(--oc-bg-primary)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          "max-width": "800px",
          flex: "1",
          "min-height": "0",
        }}
      >
        <div
          ref={editorRef}
          contentEditable={true}
          spellcheck={false}
          onInput={handleInput}
          onClick={handleCheckboxClick}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          style={{
            outline: "none",
            "font-family": "var(--oc-font-sans)",
            "font-size": "14px",
            color: "var(--oc-text-primary)",
            "min-height": "100%",
            padding: "8px 0",
            "white-space": "pre-wrap",
            "word-break": "break-word",
            cursor: "text",
          }}
        />
      </div>
    </div>
  )
}
