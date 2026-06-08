import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let nextId = 1

function createTab(filePath = null, content = '') {
  return {
    id: nextId++,
    filePath,
    content,
    savedContent: content,
  }
}

export const useEditorStore = defineStore('editor', () => {
  const tabs = ref([createTab()])
  const activeTabId = ref(tabs.value[0].id)
  const layoutMode = ref('split')

  const activeTab = computed(() =>
    tabs.value.find(t => t.id === activeTabId.value)
  )

  const content = computed(() => activeTab.value?.content ?? '')
  const filePath = computed(() => activeTab.value?.filePath ?? null)
  const savedContent = computed(() => activeTab.value?.savedContent ?? '')

  const isDirty = computed(() => content.value !== savedContent.value)

  const fileName = computed(() => {
    if (!filePath.value) return 'Untitled'
    const parts = filePath.value.split(/[/\\]/)
    return parts[parts.length - 1]
  })

  const windowTitle = computed(() => {
    const prefix = isDirty.value ? '* ' : ''
    return `${prefix}${fileName.value} — Markdown Live`
  })

  function setContent(text) {
    const tab = tabs.value.find(t => t.id === activeTabId.value)
    if (tab) tab.content = text
  }

  function markSaved() {
    const tab = tabs.value.find(t => t.id === activeTabId.value)
    if (tab) tab.savedContent = tab.content
  }

  function addTab(filePath = null, content = '') {
    const tab = createTab(filePath, content)
    tabs.value.push(tab)
    activeTabId.value = tab.id
    return tab.id
  }

  function closeTab(id) {
    const index = tabs.value.findIndex(t => t.id === id)
    if (index === -1) return

    tabs.value.splice(index, 1)

    if (tabs.value.length === 0) {
      const tab = createTab()
      tabs.value.push(tab)
      activeTabId.value = tab.id
      return
    }

    if (activeTabId.value === id) {
      const newIndex = Math.min(index, tabs.value.length - 1)
      activeTabId.value = tabs.value[newIndex].id
    }
  }

  function switchTab(id) {
    if (tabs.value.some(t => t.id === id)) {
      activeTabId.value = id
    }
  }

  function newFile() {
    addTab()
  }

  function openFile(path, text) {
    const existing = tabs.value.find(t => t.filePath === path)
    if (existing) {
      activeTabId.value = existing.id
      return
    }

    const currentTab = tabs.value.find(t => t.id === activeTabId.value)
    if (currentTab && !currentTab.filePath && currentTab.content === '' && currentTab.savedContent === '') {
      currentTab.filePath = path
      currentTab.content = text
      currentTab.savedContent = text
    } else {
      addTab(path, text)
    }
  }

  function setLayoutMode(mode) {
    layoutMode.value = mode
  }

  function isTabDirty(id) {
    const tab = tabs.value.find(t => t.id === id)
    if (!tab) return false
    return tab.content !== tab.savedContent
  }

  function hasAnyDirty() {
    return tabs.value.some(t => t.content !== t.savedContent)
  }

  function getTabFileName(id) {
    const tab = tabs.value.find(t => t.id === id)
    if (!tab || !tab.filePath) return 'Untitled'
    const parts = tab.filePath.split(/[/\\]/)
    return parts[parts.length - 1]
  }

  return {
    tabs,
    activeTabId,
    layoutMode,
    activeTab,
    content,
    filePath,
    savedContent,
    isDirty,
    fileName,
    windowTitle,
    setContent,
    markSaved,
    addTab,
    closeTab,
    switchTab,
    newFile,
    openFile,
    setLayoutMode,
    isTabDirty,
    hasAnyDirty,
    getTabFileName,
  }
})
