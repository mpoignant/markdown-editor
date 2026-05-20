import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const content = ref('')
  const filePath = ref(null)
  const savedContent = ref('')
  const layoutMode = ref('split')

  const isDirty = computed(() => content.value !== savedContent.value)

  const fileName = computed(() => {
    if (!filePath.value) return 'Untitled'
    const parts = filePath.value.split(/[/\\]/)
    return parts[parts.length - 1]
  })

  const windowTitle = computed(() => {
    const prefix = isDirty.value ? '* ' : ''
    return `${prefix}${fileName.value} — Markdown Editor`
  })

  function setContent(text) {
    content.value = text
  }

  function markSaved() {
    savedContent.value = content.value
  }

  function newFile() {
    content.value = ''
    savedContent.value = ''
    filePath.value = null
  }

  function openFile(path, text) {
    filePath.value = path
    content.value = text
    savedContent.value = text
  }

  function setLayoutMode(mode) {
    layoutMode.value = mode
  }

  return {
    content,
    filePath,
    savedContent,
    layoutMode,
    isDirty,
    fileName,
    windowTitle,
    setContent,
    markSaved,
    newFile,
    openFile,
    setLayoutMode,
  }
})
