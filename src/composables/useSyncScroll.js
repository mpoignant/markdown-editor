import { marked } from 'marked'

const BLOCK_TYPES = new Set([
  'heading', 'paragraph', 'code', 'blockquote', 'list', 'table', 'hr'
])

const BLOCK_SELECTOR = '.preview-content > h1, .preview-content > h2, .preview-content > h3, .preview-content > h4, .preview-content > h5, .preview-content > h6, .preview-content > p, .preview-content > pre, .preview-content > blockquote, .preview-content > ul, .preview-content > ol, .preview-content > table, .preview-content > hr'

export function useSyncScroll() {
  function getBlockSourceLines(sourceText) {
    const tokens = marked.lexer(sourceText)
    const lineStarts = [0]
    for (let i = 0; i < sourceText.length; i++) {
      if (sourceText[i] === '\n') lineStarts.push(i + 1)
    }

    function charToLine(charOffset) {
      let lo = 0, hi = lineStarts.length - 1
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1
        if (lineStarts[mid] <= charOffset) lo = mid
        else hi = mid - 1
      }
      return lo
    }

    const lines = []
    let charPos = 0
    for (const token of tokens) {
      if (BLOCK_TYPES.has(token.type)) {
        lines.push(charToLine(charPos))
      }
      if (token.raw != null) {
        charPos += token.raw.length
      }
    }

    return lines
  }

  function syncCursorToPreview(cursorLine, previewEl, sourceText) {
    if (!previewEl || !sourceText) return

    const blockLines = getBlockSourceLines(sourceText)
    const blockEls = previewEl.querySelectorAll(BLOCK_SELECTOR)
    const anchorCount = Math.min(blockLines.length, blockEls.length)

    if (anchorCount === 0) return

    let targetIndex = -1
    for (let i = 0; i < anchorCount; i++) {
      if (blockLines[i] <= cursorLine) {
        targetIndex = i
      } else {
        break
      }
    }

    if (targetIndex < 0) {
      previewEl.scrollTop = 0
      return
    }

    const el = blockEls[targetIndex]
    const elTop = el.getBoundingClientRect().top
      - previewEl.getBoundingClientRect().top
      + previewEl.scrollTop

    previewEl.scrollTop = elTop
  }

  return { syncCursorToPreview }
}
