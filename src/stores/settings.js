import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('system')
  const editorFont = ref('JetBrains Mono')
  const previewFont = ref('Inter')

  const fontOptions = {
    editor: ['JetBrains Mono', 'Fira Code', 'Source Code Pro'],
    preview: ['Inter', 'Georgia', 'Merriweather'],
  }

  function setTheme(newTheme) {
    theme.value = newTheme
  }

  function setEditorFont(font) {
    editorFont.value = font
  }

  function setPreviewFont(font) {
    previewFont.value = font
  }

  return {
    theme,
    editorFont,
    previewFont,
    fontOptions,
    setTheme,
    setEditorFont,
    setPreviewFont,
  }
})
