import { open, save } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEditorStore } from '../stores/editor'

export function useFileOperations() {
  const editorStore = useEditorStore()

  async function updateWindowTitle() {
    try {
      const window = getCurrentWindow()
      await window.setTitle(editorStore.windowTitle)
    } catch (e) {
      // Window API not available in browser dev mode
    }
  }

  async function newFile() {
    editorStore.newFile()
    await updateWindowTitle()
  }

  async function openFile() {
    const path = await open({
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
    })

    if (!path) return

    const content = await readTextFile(path)
    editorStore.openFile(path, content)
    await updateWindowTitle()
  }

  async function saveFile() {
    if (!editorStore.filePath) {
      return saveFileAs()
    }

    await writeTextFile(editorStore.filePath, editorStore.content)
    editorStore.markSaved()
    await updateWindowTitle()
  }

  async function saveFileAs() {
    const path = await save({
      filters: [{ name: 'Markdown', extensions: ['md'] }],
      defaultPath: editorStore.filePath || 'untitled.md',
    })

    if (!path) return

    await writeTextFile(path, editorStore.content)
    const tab = editorStore.activeTab
    if (tab) {
      tab.filePath = path
      tab.savedContent = tab.content
    }
    await updateWindowTitle()
  }

  return { newFile, openFile, saveFile, saveFileAs, updateWindowTitle }
}
