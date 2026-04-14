import { Component, onMount, onCleanup } from "solid-js"
import { useParams } from "@solidjs/router"
import { persist } from "~/lib/persist"

const DEFAULT_CONTENT = `# Todos

- [ ] First task
- [ ] Second task
- [ ] Third task
`

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderInline(text: string): string {
  let result = escapeHtml(text)
  result = result.replace(
    /`([^`]+)`/g,
    '<code style="font-family:var(--oc-font-mono);font-size:0.9em;background:var(--oc-surface-secondary);padding:1px 5px;border-radius:3px;border:1px solid var(--oc-border-primary);">$1</code>',
  )
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>")
  result = result.replace(/~~(.+?)~~/g, '<s style="opacity:0.5;">$1</s>')
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" style="color:var(--oc-accent-primary);text-decoration:none;">$1</a>',
  )
  return result
}

/** Get markdown prefix length for caret offset mapping */
function getMarkdownPrefixLength(line: string): number {
  const headingMatch = line.match(/^(#{1,6}\s+)/)
  if (headingMatch) return headingMatch[1].length
  const taskMatch = line.match(/^(\s*-\s*\[[ xX]\]\s*)/)
  if (taskMatch) return taskMatch[1].length
  const ulMatch = line.match(/^(\s*[-*]\s+)/)
  if (ulMatch) return ulMatch[1].length
  const olMatch = line.match(/^(\s*\d+\.\s+)/)
  if (olMatch) return olMatch[1].length
  const bqMatch = line.match(/^(>\s*)/)
  if (bqMatch) return bqMatch[1].length
  return 0
}

/** Render a line as formatted HTML (when unfocused) */
function renderFormattedLine(line: string, lineIndex: number): string {
  const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
  if (headingMatch) {
    const level = headingMatch[1].length
    const sizes: Record<number, string> = {
      1: "1.5em",
      2: "1.3em",
      3: "1.15em",
      4: "1.05em",
      5: "1em",
      6: "0.95em",
    }
    const content = renderInline(headingMatch[2])
    return `<div data-line="${lineIndex}" style="font-size:${sizes[level] || "1em"};font-weight:600;margin:0.4em 0 0.2em;line-height:1.4;">${content}</div>`
  }

  const taskMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/)
  if (taskMatch) {
    const indent = taskMatch[1].length
    const checked = taskMatch[2] !== " "
    const content = renderInline(taskMatch[3])
    const paddingLeft = indent * 16 + 4
    return (
      `<div data-line="${lineIndex}" style="display:flex;align-items:flex-start;gap:8px;padding:2px 0 2px ${paddingLeft}px;line-height:1.6;">` +
      `<input type="checkbox" data-task-line="${lineIndex}" ${checked ? "checked" : ""} style="margin-top:5px;cursor:pointer;accent-color:var(--oc-accent-primary);flex-shrink:0;" />` +
      `<span style="${checked ? "text-decoration:line-through;opacity:0.5;" : ""}">${content}</span>` +
      `</div>`
    )
  }

  const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/)
  if (ulMatch) {
    const indent = ulMatch[1].length
    const content = renderInline(ulMatch[2])
    const paddingLeft = indent * 16 + 4
    return (
      `<div data-line="${lineIndex}" style="padding:2px 0 2px ${paddingLeft}px;line-height:1.6;">` +
      `<span style="margin-right:8px;opacity:0.4;">\u2022</span>${content}</div>`
    )
  }

  const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/)
  if (olMatch) {
    const indent = olMatch[1].length
    const num = olMatch[2]
    const content = renderInline(olMatch[3])
    const paddingLeft = indent * 16 + 4
    return (
      `<div data-line="${lineIndex}" style="padding:2px 0 2px ${paddingLeft}px;line-height:1.6;">` +
      `<span style="margin-right:8px;opacity:0.5;font-size:0.9em;">${num}.</span>${content}</div>`
    )
  }

  const bqMatch = line.match(/^>\s*(.*)$/)
  if (bqMatch) {
    const content = renderInline(bqMatch[1])
    return `<div data-line="${lineIndex}" style="border-left:3px solid var(--oc-border-primary);padding-left:12px;color:var(--oc-text-secondary);line-height:1.6;margin:2px 0;">${content}</div>`
  }

  if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
    return `<hr data-line="${lineIndex}" style="border:none;border-top:1px solid var(--oc-border-primary);margin:8px 0;" />`
  }

  if (line.trim() === "") {
    return `<div data-line="${lineIndex}" style="height:0.6em;">\u200b</div>`
  }

  return `<div data-line="${lineIndex}" style="padding:2px 0;line-height:1.6;">${renderInline(line)}</div>`
}

/** Render a line as raw markdown text (when focused / cursor on it) */
function renderRawLine(line: string, lineIndex: number): string {
  const text = line === "" ? "\u200b" : escapeHtml(line)
  return `<div data-line="${lineIndex}" data-raw="true" style="padding:2px 0;line-height:1.6;min-height:1.4em;">${text}</div>`
}

/** Place the caret inside a line element at a character offset */
function setCaretInLine(lineEl: HTMLElement, offset: number) {
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()

  const walker = document.createTreeWalker(lineEl, NodeFilter.SHOW_TEXT)
  let current = 0
  let node: Text | null = null

  while ((node = walker.nextNode() as Text | null)) {
    const len = node.textContent?.length ?? 0
    if (current + len >= offset) {
      range.setStart(node, Math.min(offset - current, len))
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
      return
    }
    current += len
  }

  range.selectNodeContents(lineEl)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

/** Get caret character offset within a line element */
function getCaretInLine(lineEl: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return 0
  try {
    const range = sel.getRangeAt(0)
    const preRange = document.createRange()
    preRange.selectNodeContents(lineEl)
    preRange.setEnd(range.startContainer, range.startOffset)
    return preRange.toString().length
  } catch {
    return 0
  }
}

/** Find the data-line ancestor of a DOM node */
function findLineElement(node: Node | null, root: HTMLElement): HTMLElement | null {
  while (node && node !== root) {
    if (node instanceof HTMLElement && node.hasAttribute("data-line")) {
      return node
    }
    node = node.parentNode
  }
  return null
}

export const TodosPage: Component = () => {
  const params = useParams<{ dir: string }>()
  const storageKey = () => `todos.${params.dir}`

  let editorRef: HTMLDivElement | undefined

  // Imperative state (not reactive signals — we control rendering manually)
  let lines: string[] = []
  let focusedLine: number | null = null
  let isUpdating = false
  let saveTimeout: ReturnType<typeof setTimeout> | undefined
  let isComposing = false

  function save() {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      const storage = persist<string>(storageKey(), DEFAULT_CONTENT)
      storage.set(lines.join("\n"))
    }, 300)
  }

  /** Full re-render of the editor. Optionally place caret at line:offset. */
  function fullRender(caret?: { line: number; offset: number }) {
    if (!editorRef) return
    isUpdating = true

    const html = lines
      .map((line, i) => (i === focusedLine ? renderRawLine(line, i) : renderFormattedLine(line, i)))
      .join("")

    editorRef.innerHTML = html

    if (caret != null) {
      const lineEl = editorRef.querySelector(`[data-line="${caret.line}"]`) as HTMLElement | null
      if (lineEl) {
        setCaretInLine(lineEl, caret.offset)
      }
    }

    // Defer clearing the flag so selectionchange triggered by our innerHTML write is ignored
    requestAnimationFrame(() => {
      isUpdating = false
    })
  }

  /** Save the focused line's text content back into `lines[]` */
  function saveFocusedLineText() {
    if (focusedLine === null || !editorRef) return
    const lineEl = editorRef.querySelector(`[data-line="${focusedLine}"]`) as HTMLElement | null
    if (!lineEl) return
    const text = lineEl.textContent || ""
    lines[focusedLine] = text === "\u200b" ? "" : text
  }

  /** Called on every selectionchange to detect line focus transitions */
  function handleSelectionChange() {
    if (isUpdating || isComposing || !editorRef) return

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    if (!editorRef.contains(sel.anchorNode)) return

    const lineEl = findLineElement(sel.anchorNode, editorRef)
    if (!lineEl) return

    const newLine = parseInt(lineEl.getAttribute("data-line") || "0")
    if (newLine === focusedLine) return

    // Capture caret offset in the formatted line before we switch it to raw
    const caretInFormatted = getCaretInLine(lineEl)

    // Save old focused line's edits
    saveFocusedLineText()

    // Calculate caret position in raw text
    const rawLine = lines[newLine] ?? ""
    const prefixLen = getMarkdownPrefixLength(rawLine)
    // In formatted view, the prefix is hidden (rendered as widget/style).
    // Map formatted offset to raw: add the prefix length.
    const rawOffset = prefixLen + caretInFormatted

    focusedLine = newLine
    fullRender({ line: newLine, offset: rawOffset })
  }

  function handleInput() {
    if (isUpdating || isComposing) return
    if (focusedLine === null || !editorRef) return

    // Read text directly from the focused (raw) line element
    const lineEl = editorRef.querySelector(`[data-line="${focusedLine}"]`) as HTMLElement | null
    if (!lineEl) return

    const text = lineEl.textContent || ""
    lines[focusedLine] = text === "\u200b" ? "" : text
    save()
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
    if (target.tagName !== "INPUT" || target.getAttribute("type") !== "checkbox") return

    const lineIdx = parseInt(target.getAttribute("data-task-line") || "-1")
    if (lineIdx < 0 || lineIdx >= lines.length) return

    e.preventDefault()

    const line = lines[lineIdx]
    if (/- \[ \]/.test(line)) {
      lines[lineIdx] = line.replace("- [ ]", "- [x]")
    } else if (/- \[x\]/i.test(line)) {
      lines[lineIdx] = line.replace(/- \[x\]/i, "- [ ]")
    }

    // Keep focus where it is, re-render
    fullRender(
      focusedLine !== null
        ? { line: focusedLine, offset: lines[focusedLine]?.length ?? 0 }
        : undefined,
    )
    save()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (focusedLine === null || !editorRef) return

      // Save current line text
      saveFocusedLineText()
      const currentLine = lines[focusedLine]

      // Get caret offset in raw text to split the line
      const lineEl = editorRef.querySelector(`[data-line="${focusedLine}"]`) as HTMLElement | null
      const caretOffset = lineEl ? getCaretInLine(lineEl) : currentLine.length

      const before = currentLine.slice(0, caretOffset)
      const after = currentLine.slice(caretOffset)

      // Determine continuation prefix
      let prefix = ""
      const taskMatch = currentLine.match(/^(\s*)-\s*\[[ xX]\]\s*/)
      const olMatch = currentLine.match(/^(\s*)(\d+)\.\s+/)
      const ulMatch = currentLine.match(/^(\s*)[-*]\s+/)

      if (taskMatch) {
        // If the line was empty after prefix, remove the prefix instead of continuing
        if (after === "" && before === currentLine && !currentLine.match(/^(\s*)-\s*\[[ xX]\]\s*.+/)) {
          lines[focusedLine] = ""
          fullRender({ line: focusedLine, offset: 0 })
          save()
          return
        }
        prefix = `${taskMatch[1]}- [ ] `
      } else if (olMatch) {
        prefix = `${olMatch[1]}${parseInt(olMatch[2]) + 1}. `
      } else if (ulMatch) {
        if (after === "" && !currentLine.match(/^(\s*)[-*]\s+.+/)) {
          lines[focusedLine] = ""
          fullRender({ line: focusedLine, offset: 0 })
          save()
          return
        }
        prefix = `${ulMatch[1]}- `
      }

      lines[focusedLine] = before
      lines.splice(focusedLine + 1, 0, prefix + after)

      focusedLine = focusedLine + 1
      fullRender({ line: focusedLine, offset: prefix.length })
      save()
    }

    if (e.key === "Tab") {
      e.preventDefault()
      if (focusedLine === null) return

      saveFocusedLineText()

      if (e.shiftKey) {
        lines[focusedLine] = lines[focusedLine].replace(/^  /, "")
      } else {
        lines[focusedLine] = "  " + lines[focusedLine]
      }

      fullRender({ line: focusedLine, offset: lines[focusedLine].length })
      save()
    }

    if (e.key === "Backspace") {
      if (focusedLine === null || !editorRef) return

      const lineEl = editorRef.querySelector(`[data-line="${focusedLine}"]`) as HTMLElement | null
      if (!lineEl) return

      const caretOffset = getCaretInLine(lineEl)

      if (caretOffset === 0) {
        e.preventDefault()
        saveFocusedLineText()

        if (focusedLine === 0) return

        // Merge with previous line
        const prevLine = lines[focusedLine - 1]
        const curLine = lines[focusedLine]
        const prevLen = prevLine.length
        lines[focusedLine - 1] = prevLine + curLine
        lines.splice(focusedLine, 1)

        focusedLine = focusedLine - 1
        fullRender({ line: focusedLine, offset: prevLen })
        save()
      }
    }

    // ArrowUp at first line or ArrowDown at last line — stay in editor
    // Other arrow keys are handled natively by the browser; selectionchange
    // detects the line transition.
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData?.getData("text/plain") ?? ""
    if (!text || focusedLine === null || !editorRef) return

    saveFocusedLineText()

    const lineEl = editorRef.querySelector(`[data-line="${focusedLine}"]`) as HTMLElement | null
    const caretOffset = lineEl ? getCaretInLine(lineEl) : lines[focusedLine].length

    const currentLine = lines[focusedLine]
    const before = currentLine.slice(0, caretOffset)
    const after = currentLine.slice(caretOffset)
    const pasteLines = text.split("\n")

    if (pasteLines.length === 1) {
      lines[focusedLine] = before + text + after
      fullRender({ line: focusedLine, offset: caretOffset + text.length })
    } else {
      lines[focusedLine] = before + pasteLines[0]
      const newLines = pasteLines.slice(1, -1)
      const lastPasteLine = pasteLines[pasteLines.length - 1] + after
      lines.splice(focusedLine + 1, 0, ...newLines, lastPasteLine)

      const newFocusedLine = focusedLine + pasteLines.length - 1
      focusedLine = newFocusedLine
      fullRender({ line: newFocusedLine, offset: pasteLines[pasteLines.length - 1].length })
    }

    save()
  }

  function handleBlur(e: FocusEvent) {
    // If focus moves outside the editor, save and unfocus all lines
    const related = e.relatedTarget as Node | null
    if (related && editorRef?.contains(related)) return

    saveFocusedLineText()
    focusedLine = null
    fullRender()
    save()
  }

  // Click on the outer container (below content) should focus the last line
  function handleContainerClick(e: MouseEvent) {
    if (e.target !== editorRef && editorRef?.contains(e.target as Node)) return
    if (!editorRef) return

    // Focus the editor at the end
    const lastLine = lines.length - 1
    if (lastLine < 0) return
    focusedLine = lastLine
    fullRender({ line: lastLine, offset: lines[lastLine].length })
    editorRef.focus()
  }

  onMount(() => {
    const storage = persist<string>(storageKey(), DEFAULT_CONTENT)
    lines = storage.get().split("\n")
    fullRender()

    document.addEventListener("selectionchange", handleSelectionChange)
  })

  onCleanup(() => {
    document.removeEventListener("selectionchange", handleSelectionChange)
    clearTimeout(saveTimeout)
  })

  return (
    <div
      onClick={handleContainerClick}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        overflow: "auto",
        background: "var(--oc-bg-primary)",
        padding: "24px",
        cursor: "text",
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
          onBlur={handleBlur}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          style={{
            outline: "none",
            "font-family": "var(--oc-font-sans)",
            "font-size": "14px",
            color: "var(--oc-text-primary)",
            "min-height": "100%",
            padding: "8px 0",
            "word-break": "break-word",
            cursor: "text",
          }}
        />
      </div>
    </div>
  )
}
