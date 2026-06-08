<template>
  <div class="tabbar" ref="tabbarRef" @dblclick.self="editorStore.newFile()" @wheel.prevent="onWheel">
    <div
      v-for="tab in editorStore.tabs"
      :key="tab.id"
      class="tab"
      :class="{ active: tab.id === editorStore.activeTabId }"
      @mousedown="editorStore.switchTab(tab.id)"
    >
      <span class="tab-name">{{ editorStore.getTabFileName(tab.id) }}</span>
      <span v-if="editorStore.isTabDirty(tab.id)" class="tab-dirty">&bull;</span>
      <button class="tab-close" @mousedown.stop @click.stop="closeTab(tab.id)" title="Close">&times;</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from '../stores/editor'

const editorStore = useEditorStore()
const tabbarRef = ref(null)

function closeTab(id) {
  if (editorStore.isTabDirty(id)) {
    const name = editorStore.getTabFileName(id)
    const confirmed = window.confirm(`"${name}" has unsaved changes. Close anyway?`)
    if (!confirmed) return
  }
  editorStore.closeTab(id)
}

function onWheel(event) {
  if (tabbarRef.value) {
    tabbarRef.value.scrollLeft += event.deltaY || event.deltaX
  }
}
</script>

<style>
.tabbar {
  display: flex;
  align-items: stretch;
  height: 34px;
  background-color: var(--color-toolbar-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.tabbar::-webkit-scrollbar {
  display: none;
}

.tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 var(--spacing-sm);
  padding-right: 4px;
  min-width: 0;
  max-width: 180px;
  cursor: pointer;
  border-right: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 12px;
  white-space: nowrap;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  position: relative;
}

.tab:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  box-shadow: inset 0 -2px 0 var(--color-accent);
}

.tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-dirty {
  color: var(--color-accent);
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-muted);
  opacity: 0;
  transition: opacity var(--transition-fast), background-color var(--transition-fast);
  flex-shrink: 0;
}

.tab:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}
</style>
