<template>
  <div class="statusbar">
    <span class="statusbar-item">{{ wordCount }} words</span>
    <span class="statusbar-item">{{ charCount }} chars</span>
    <span class="statusbar-separator"></span>
    <span class="statusbar-item">{{ editorStore.fileName }}</span>
    <span v-if="editorStore.isDirty" class="statusbar-item statusbar-dirty">Modified</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../stores/editor'

const editorStore = useEditorStore()

const wordCount = computed(() => {
  const text = editorStore.content.trim()
  if (!text) return 0
  return text.split(/\s+/).length
})

const charCount = computed(() => editorStore.content.length)
</script>

<style>
.statusbar {
  display: flex;
  align-items: center;
  height: var(--statusbar-height);
  padding: 0 var(--spacing-md);
  background-color: var(--color-toolbar-bg);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-muted);
  gap: var(--spacing-md);
}

.statusbar-separator {
  flex: 1;
}

.statusbar-dirty {
  color: var(--color-accent);
  font-weight: 500;
}
</style>
