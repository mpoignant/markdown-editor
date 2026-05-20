<template>
  <div class="toolbar">
    <div class="toolbar-group">
      <button class="toolbar-btn" title="Bold" @click="format('bold')">B</button>
      <button class="toolbar-btn" title="Italic" @click="format('italic')">
        <em>I</em>
      </button>
      <button class="toolbar-btn" title="Strikethrough" @click="format('strikethrough')">
        <s>S</s>
      </button>
      <button class="toolbar-btn" title="Heading" @click="format('heading')">H</button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn toolbar-btn-wide" title="Bullet List" @click="format('list')">
        &bull; List
      </button>
      <button class="toolbar-btn toolbar-btn-wide" title="Ordered List" @click="format('ordered-list')">
        1. List
      </button>
      <button class="toolbar-btn toolbar-btn-wide" title="Task List" @click="format('task-list')">
        &square; Task
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn toolbar-btn-wide" title="Blockquote" @click="format('blockquote')">
        &gt; Quote
      </button>
      <button class="toolbar-btn toolbar-btn-wide" title="Inline Code" @click="format('code')">
        Code
      </button>
      <button class="toolbar-btn toolbar-btn-wide" title="Code Block" @click="format('code-block')">
        &lt;/&gt;
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn toolbar-btn-wide" title="Link" @click="format('link')">
        Link
      </button>
      <button class="toolbar-btn toolbar-btn-wide" title="Image" @click="format('image')">
        Img
      </button>
      <button class="toolbar-btn toolbar-btn-wide" title="Horizontal Rule" @click="format('hr')">
        &mdash;
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button
        class="toolbar-btn toolbar-btn-wide"
        :class="{ active: editorStore.layoutMode === 'split' }"
        title="Split View"
        @click="editorStore.setLayoutMode('split')"
      >
        Split
      </button>
      <button
        class="toolbar-btn toolbar-btn-wide"
        :class="{ active: editorStore.layoutMode === 'preview-only' }"
        title="Preview Only"
        @click="editorStore.setLayoutMode('preview-only')"
      >
        Preview
      </button>
      <button
        class="toolbar-btn toolbar-btn-wide"
        :class="{ active: editorStore.layoutMode === 'focus' }"
        title="Focus Mode"
        @click="editorStore.setLayoutMode('focus')"
      >
        Focus
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <select
        class="toolbar-select"
        :value="settingsStore.editorFont"
        @change="settingsStore.setEditorFont($event.target.value)"
        title="Editor Font"
      >
        <option v-for="font in settingsStore.fontOptions.editor" :key="font" :value="font">
          {{ font }}
        </option>
      </select>
    </div>

    <div class="toolbar-spacer"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn toolbar-btn-wide" title="Theme" @click="cycleTheme">
        {{ themeLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../stores/editor'
import { useSettingsStore } from '../stores/settings'

const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const emit = defineEmits(['format'])

const themeLabel = computed(() => {
  const labels = { light: 'Light', dark: 'Dark', system: 'Auto' }
  return labels[settingsStore.theme] || 'Auto'
})

function cycleTheme() {
  const order = ['system', 'light', 'dark']
  const current = order.indexOf(settingsStore.theme)
  const next = order[(current + 1) % order.length]
  settingsStore.setTheme(next)
}

function format(type) {
  emit('format', type)
}
</script>
