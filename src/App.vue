<template>
  <div
    class="app-container"
    :class="`layout-${editorStore.layoutMode}`"
    :data-theme="settingsStore.theme"
  >
    <Toolbar @format="onFormat" />
    <TabBar />
    <div class="main-content">
      <div class="editor-pane">
        <EditorPane ref="editorRef" @cursor-move="onCursorMove" />
      </div>
      <div class="preview-pane">
        <PreviewPane ref="previewRef" :html="renderedHtml" />
      </div>
    </div>
    <StatusBar />
    <AboutDialog ref="aboutRef" />
  </div>
</template>

<script setup>
import { defineAsyncComponent, ref, computed, watch, onMounted } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { message } from '@tauri-apps/plugin-dialog'
import { useEditorStore } from './stores/editor'
import { useSettingsStore } from './stores/settings'
import { useMarkdownParser } from './composables/useMarkdownParser'
import { useSyncScroll } from './composables/useSyncScroll'
import { useFileOperations } from './composables/useFileOperations'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import Toolbar from './components/Toolbar.vue'
import TabBar from './components/TabBar.vue'
import EditorPane from './components/EditorPane.vue'
import PreviewPane from './components/PreviewPane.vue'
import StatusBar from './components/StatusBar.vue'
const AboutDialog = defineAsyncComponent(() => import('./components/AboutDialog.vue'))

const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const source = computed(() => editorStore.content)
const filePathRef = computed(() => editorStore.filePath)
const { html: renderedHtml } = useMarkdownParser(source, filePathRef)

const editorRef = ref(null)
const previewRef = ref(null)
const aboutRef = ref(null)
const { syncCursorToPreview } = useSyncScroll()

const { newFile, openFile, saveFile, saveFileAs } = useFileOperations()

function closeActiveTab() {
  if (editorStore.isTabDirty(editorStore.activeTabId)) {
    const name = editorStore.fileName
    const confirmed = window.confirm(`"${name}" has unsaved changes. Close anyway?`)
    if (!confirmed) return
  }
  editorStore.closeTab(editorStore.activeTabId)
}

useKeyboardShortcuts({
  save: saveFile,
  open: openFile,
  new: newFile,
  newTab: () => editorStore.newFile(),
  closeTab: closeActiveTab,
})

onMounted(async () => {
  try {
    const win = getCurrentWindow()
    await win.onCloseRequested(async (event) => {
      event.preventDefault()

      if (!editorStore.hasAnyDirty()) {
        await win.destroy()
        return
      }

      const result = await message(
        'Des documents ont été modifiés. Voulez-vous quitter sans enregistrer ?',
        {
          title: 'Modifications non enregistrées',
          kind: 'warning',
          buttons: { yes: 'Quitter', no: 'Annuler' },
        }
      )

      if (result === 'Quitter') {
        await win.destroy()
      }
    })

    await listen('menu-event', (event) => {
      const payload = event.payload

      if (payload === 'about') {
        aboutRef.value?.show()
        return
      }

      const actions = {
        'new': newFile,
        'open': openFile,
        'save': saveFile,
        'save-as': saveFileAs,
      }
      const action = actions[payload]
      if (action) {
        action()
        return
      }

      const editor = editorRef.value
      if (!editor) return

      const headingMatch = payload.match(/^heading-(\d)$/)
      if (headingMatch) {
        editor.setHeadingLevel(parseInt(headingMatch[1]))
        return
      }

      const formatActions = {
        'bold': () => editor.toggleInlineFormat('**'),
        'italic': () => editor.toggleInlineFormat('_'),
        'strikethrough': () => editor.toggleInlineFormat('~~'),
        'code': () => editor.toggleInlineFormat('`'),
        'link': () => editor.insertText('[', '](url)'),
        'image': () => editor.insertText('![', '](url)'),
        'blockquote': () => editor.insertLinePrefix('> '),
        'ordered-list': () => editor.insertLinePrefix('1. '),
        'list': () => editor.insertLinePrefix('- '),
        'task-list': () => editor.insertLinePrefix('- [ ] '),
      }
      const fmt = formatActions[payload]
      if (fmt) fmt()
    })

    await listen('tauri://drag-drop', async (event) => {
      const paths = event.payload.paths
      if (!paths || paths.length === 0) return

      for (const path of paths) {
        if (!path.match(/\.(md|markdown|txt)$/i)) continue
        await openFilePath(path)
      }
    })

    await listen('open-file', async (event) => {
      const path = event.payload
      if (path) await openFilePath(path)
    })

    const initialFile = await invoke('get_open_file_path')
    if (initialFile) {
      await openFilePath(initialFile)
    }
  } catch (e) {
    // Events not available in browser dev mode
  }
})

async function openFilePath(path) {
  const existing = editorStore.tabs.find(t => t.filePath === path)
  if (existing) {
    editorStore.switchTab(existing.id)
    return
  }

  const content = await invoke('read_file_content', { path })
  editorStore.openFile(path, content)

  const win = getCurrentWindow()
  await win.setTitle(editorStore.windowTitle)
}

function onCursorMove(cursorLine) {
  const previewEl = previewRef.value?.wrapperRef
  syncCursorToPreview(cursorLine, previewEl, editorStore.content)
}

function onFormat(type) {
  const editor = editorRef.value
  if (!editor) return

  switch (type) {
    case 'bold':
      editor.toggleInlineFormat('**')
      break
    case 'italic':
      editor.toggleInlineFormat('_')
      break
    case 'strikethrough':
      editor.toggleInlineFormat('~~')
      break
    case 'code':
      editor.toggleInlineFormat('`')
      break
    case 'heading':
      editor.insertLinePrefix('## ')
      break
    case 'list':
      editor.insertLinePrefix('- ')
      break
    case 'ordered-list':
      editor.insertLinePrefix('1. ')
      break
    case 'task-list':
      editor.insertLinePrefix('- [ ] ')
      break
    case 'blockquote':
      editor.insertLinePrefix('> ')
      break
    case 'link':
      editor.insertText('[', '](url)')
      break
    case 'image':
      editor.insertText('![', '](url)')
      break
    case 'code-block':
      editor.insertBlock('```\n$1\n```')
      break
    case 'hr':
      editor.insertBlock('---')
      break
  }
}

watch(
  () => editorStore.windowTitle,
  async (title) => {
    try {
      const window = getCurrentWindow()
      await window.setTitle(title)
    } catch (e) {
      // Window API not available in dev browser
    }
  },
  { immediate: true }
)
</script>
