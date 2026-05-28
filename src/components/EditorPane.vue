<template>
  <div class="editor-wrapper" ref="wrapperRef"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, undo, redo } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { useEditorStore } from '../stores/editor'
import { useSettingsStore } from '../stores/settings'

const emit = defineEmits(['cursor-move'])
const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const wrapperRef = ref(null)
let view = null
let ignoreUpdate = false

const theme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: 'var(--font-size-editor)',
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-editor)',
    lineHeight: '1.6',
    padding: 'var(--spacing-lg)',
    overflow: 'auto',
  },
  '.cm-content': {
    caretColor: 'var(--color-text-primary)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--color-text-primary)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'var(--color-bg-tertiary)',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '&.cm-focused': {
    outline: 'none',
  },
})

const themeColors = EditorView.baseTheme({
  '&.cm-editor': {
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
  },
})

const formatKeymap = [
  { key: 'Mod-b', run: () => { toggleInlineFormat('**'); return true } },
  { key: 'Mod-i', run: () => { toggleInlineFormat('_'); return true } },
  { key: 'Mod-Shift-x', run: () => { toggleInlineFormat('~~'); return true } },
  { key: 'Mod-e', run: () => { toggleInlineFormat('`'); return true } },
  { key: 'Mod-k', run: () => { insertText('[', '](url)'); return true } },
  { key: 'Mod-Shift-k', run: () => { insertText('![', '](url)'); return true } },
  { key: 'Mod-Shift-.', run: () => { insertLinePrefix('> '); return true } },
  { key: 'Mod-Shift-7', run: () => { insertLinePrefix('1. '); return true } },
  { key: 'Mod-Shift-8', run: () => { insertLinePrefix('- '); return true } },
  { key: 'Mod-Shift-9', run: () => { insertLinePrefix('- [ ] '); return true } },
  { key: 'Mod-Shift-h', run: () => { insertLinePrefix('## '); return true } },
]

function createState(doc) {
  return EditorState.create({
    doc,
    extensions: [
      history(),
      keymap.of([...formatKeymap, ...defaultKeymap, ...historyKeymap]),
      markdown({ codeLanguages: languages }),
      placeholder('Start writing Markdown...'),
      theme,
      themeColors,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !ignoreUpdate) {
          editorStore.setContent(update.state.doc.toString())
        }
        if (update.selectionSet) {
          const pos = update.state.selection.main.head
          const line = update.state.doc.lineAt(pos).number - 1
          emit('cursor-move', line)
        }
      }),
      EditorView.lineWrapping,
    ],
  })
}

onMounted(() => {
  view = new EditorView({
    state: createState(editorStore.content),
    parent: wrapperRef.value,
  })
})

onBeforeUnmount(() => {
  if (view) {
    view.destroy()
    view = null
  }
})

watch(() => editorStore.content, (newVal) => {
  if (!view) return
  const current = view.state.doc.toString()
  if (current !== newVal) {
    ignoreUpdate = true
    view.dispatch({
      changes: { from: 0, to: current.length, insert: newVal },
    })
    ignoreUpdate = false
  }
})

watch(() => settingsStore.editorFont, (font) => {
  if (!view) return
  view.dispatch({
    effects: EditorView.editorAttributes.reconfigure(
      EditorView.editorAttributes.of({ style: `font-family: ${font}` })
    ),
  })
})

function insertText(before, after = '') {
  if (!view) return
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const replacement = before + selected + after
  view.dispatch({
    changes: { from, to, insert: replacement },
    selection: { anchor: from + before.length, head: from + before.length + selected.length },
  })
  view.focus()
}

function toggleInlineFormat(marker) {
  if (!view) return
  const { from, to } = view.state.selection.main
  const doc = view.state.doc.toString()
  const len = marker.length

  const beforeMarker = doc.substring(from - len, from)
  const afterMarker = doc.substring(to, to + len)

  if (beforeMarker === marker && afterMarker === marker) {
    const selected = doc.substring(from, to)
    view.dispatch({
      changes: { from: from - len, to: to + len, insert: selected },
      selection: { anchor: from - len, head: from - len + selected.length },
    })
  } else {
    const selected = doc.substring(from, to)
    if (selected.startsWith(marker) && selected.endsWith(marker) && selected.length >= len * 2) {
      const inner = selected.substring(len, selected.length - len)
      view.dispatch({
        changes: { from, to, insert: inner },
        selection: { anchor: from, head: from + inner.length },
      })
    } else {
      insertText(marker, marker)
    }
  }
  view.focus()
}

function insertLinePrefix(prefix) {
  if (!view) return
  const { from, to } = view.state.selection.main
  const doc = view.state.doc.toString()

  const lineStart = doc.lastIndexOf('\n', from - 1) + 1
  let lineEnd = doc.indexOf('\n', to)
  if (lineEnd === -1) lineEnd = doc.length

  const selectedLines = doc.substring(lineStart, lineEnd)
  const lines = selectedLines.split('\n')

  const allHavePrefix = lines.every(l => l.startsWith(prefix))
  const replacement = allHavePrefix
    ? lines.map(l => l.substring(prefix.length)).join('\n')
    : lines.map(l => prefix + l).join('\n')

  view.dispatch({
    changes: { from: lineStart, to: lineEnd, insert: replacement },
    selection: { anchor: lineStart, head: lineStart + replacement.length },
  })
  view.focus()
}

function setHeadingLevel(level) {
  if (!view) return
  const { from } = view.state.selection.main
  const doc = view.state.doc.toString()
  const lineStart = doc.lastIndexOf('\n', from - 1) + 1
  let lineEnd = doc.indexOf('\n', from)
  if (lineEnd === -1) lineEnd = doc.length

  const line = doc.substring(lineStart, lineEnd)
  const stripped = line.replace(/^#{1,6}\s*/, '')
  const prefix = '#'.repeat(level) + ' '
  const replacement = prefix + stripped

  view.dispatch({
    changes: { from: lineStart, to: lineEnd, insert: replacement },
    selection: { anchor: lineStart + replacement.length },
  })
  view.focus()
}

function insertBlock(block) {
  if (!view) return
  const { from, to } = view.state.selection.main
  const doc = view.state.doc.toString()
  const selected = doc.substring(from, to)

  const before = from > 0 && doc[from - 1] !== '\n' ? '\n' : ''
  const after = to < doc.length && doc[to] !== '\n' ? '\n' : ''
  const replacement = before + block.replace('$1', selected) + after

  view.dispatch({
    changes: { from, to, insert: replacement },
  })
  view.focus()
}

function undoEditor() {
  if (view) undo(view)
}

function redoEditor() {
  if (view) redo(view)
}

defineExpose({ wrapperRef, insertText, toggleInlineFormat, insertLinePrefix, insertBlock, setHeadingLevel, undoEditor, redoEditor })
</script>

