<template>
  <div class="editor-wrapper">
    <textarea
      ref="textareaRef"
      class="editor-textarea"
      :style="{ fontFamily: settingsStore.editorFont }"
      @input="onInput"
      @keyup="onCursorMove"
      @click="onCursorMove"
      @keydown.tab.prevent="onTab"
      placeholder="Start writing Markdown..."
      spellcheck="false"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useEditorStore } from '../stores/editor'
import { useSettingsStore } from '../stores/settings'

const emit = defineEmits(['cursor-move'])
const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const textareaRef = ref(null)
let ignoreNextInput = false

onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.value = editorStore.content
  }
})

watch(() => editorStore.content, (newVal) => {
  const textarea = textareaRef.value
  if (!textarea) return
  if (textarea.value !== newVal) {
    ignoreNextInput = true
    textarea.value = newVal
  }
})

function onInput(event) {
  if (ignoreNextInput) {
    ignoreNextInput = false
    return
  }
  editorStore.setContent(event.target.value)
  onCursorMove(event)
}

function onCursorMove(event) {
  const textarea = event.target || textareaRef.value
  if (!textarea) return
  const pos = textarea.selectionStart
  const textBefore = textarea.value.substring(0, pos)
  const line = textBefore.split('\n').length - 1
  emit('cursor-move', line)
}

function onTab(event) {
  const textarea = event.target
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  textarea.focus()
  textarea.setSelectionRange(start, end)
  document.execCommand('insertText', false, '  ')

  editorStore.setContent(textarea.value)
}

function insertText(before, after = '') {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.substring(start, end)
  const replacement = before + selected + after

  textarea.focus()
  textarea.setSelectionRange(start, end)
  document.execCommand('insertText', false, replacement)

  editorStore.setContent(textarea.value)

  const cursorPos = start + before.length + selected.length
  textarea.setSelectionRange(start + before.length, cursorPos)
}

function toggleInlineFormat(marker) {
  const textarea = textareaRef.value
  if (!textarea) return

  const value = textarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const len = marker.length

  const beforeMarker = value.substring(start - len, start)
  const afterMarker = value.substring(end, end + len)

  textarea.focus()

  if (beforeMarker === marker && afterMarker === marker) {
    // Remove markers around selection
    textarea.setSelectionRange(start - len, end + len)
    const selected = value.substring(start, end)
    document.execCommand('insertText', false, selected)
    editorStore.setContent(textarea.value)
    textarea.setSelectionRange(start - len, end - len)
  } else {
    // Check if selection itself starts/ends with marker
    const selected = value.substring(start, end)
    if (selected.startsWith(marker) && selected.endsWith(marker) && selected.length >= len * 2) {
      const inner = selected.substring(len, selected.length - len)
      textarea.setSelectionRange(start, end)
      document.execCommand('insertText', false, inner)
      editorStore.setContent(textarea.value)
      textarea.setSelectionRange(start, start + inner.length)
    } else {
      // Add markers
      insertText(marker, marker)
    }
  }
}

function insertLinePrefix(prefix) {
  const textarea = textareaRef.value
  if (!textarea) return

  const value = textarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  // Find the start of the current line
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  // Find the end of the last selected line
  let lineEnd = value.indexOf('\n', end)
  if (lineEnd === -1) lineEnd = value.length

  const selectedLines = value.substring(lineStart, lineEnd)
  const lines = selectedLines.split('\n')

  // Check if all lines already have the prefix — if so, remove it
  const allHavePrefix = lines.every(l => l.startsWith(prefix))

  let replacement
  if (allHavePrefix) {
    replacement = lines.map(l => l.substring(prefix.length)).join('\n')
  } else {
    replacement = lines.map(l => prefix + l).join('\n')
  }

  textarea.focus()
  textarea.setSelectionRange(lineStart, lineEnd)
  document.execCommand('insertText', false, replacement)
  editorStore.setContent(textarea.value)
  textarea.setSelectionRange(lineStart, lineStart + replacement.length)
}

function insertBlock(block) {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.substring(start, end)

  const before = start > 0 && textarea.value[start - 1] !== '\n' ? '\n' : ''
  const after = end < textarea.value.length && textarea.value[end] !== '\n' ? '\n' : ''
  const replacement = before + block.replace('$1', selected) + after

  textarea.focus()
  textarea.setSelectionRange(start, end)
  document.execCommand('insertText', false, replacement)
  editorStore.setContent(textarea.value)
}

defineExpose({ textareaRef, insertText, toggleInlineFormat, insertLinePrefix, insertBlock })
</script>
