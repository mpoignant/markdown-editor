# Markdown Editor Desktop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-platform desktop Markdown editor with Tauri 2, featuring split-screen live preview, native file system integration, and a polished UI with light/dark themes.

**Architecture:** Tauri 2 backend (Rust) handles window management and native OS integration. Vue 3 frontend (Composition API + Pinia) manages the editor state, toolbar, layout modes, and rendering pipeline. `marked.js` converts Markdown to HTML in the preview pane; `prism.js` highlights code blocks.

**Tech Stack:** Tauri 2, Rust, Vite, Vue.js 3 (Composition API), Pinia, marked.js, prism.js, Vanilla CSS, Tauri plugins (fs, dialog, shell)

---

## Prerequisites

Before starting any task, the development machine needs:

1. **Rust toolchain** — required by Tauri 2's Rust backend
2. **Node.js** (already installed: v26.0.0) and **npm** (already installed: v11.12.1)
3. **Xcode Command Line Tools** (macOS) — for native compilation

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustc --version  # confirm

# Xcode CLT (if not present)
xcode-select --install
```

---

## File Structure

```
markdown-editor/
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   └── src/
│       └── lib.rs
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── variables.css
│   │   │   ├── reset.css
│   │   │   ├── layout.css
│   │   │   ├── editor.css
│   │   │   ├── preview.css
│   │   │   ├── toolbar.css
│   │   │   └── themes.css
│   │   └── fonts/
│   ├── components/
│   │   ├── EditorPane.vue
│   │   ├── PreviewPane.vue
│   │   ├── Toolbar.vue
│   │   ├── StatusBar.vue
│   │   └── ThemeToggle.vue
│   ├── composables/
│   │   ├── useMarkdownParser.js
│   │   ├── useSyncScroll.js
│   │   ├── useFileOperations.js
│   │   └── useKeyboardShortcuts.js
│   └── stores/
│       ├── editor.js
│       └── settings.js
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

### Responsibilities

| File | Responsibility |
|------|---------------|
| `src-tauri/src/lib.rs` | Tauri app entry, plugin registration |
| `src-tauri/tauri.conf.json` | Window config, app metadata, permissions |
| `src-tauri/capabilities/default.json` | Plugin permissions (fs, dialog, shell) |
| `src/App.vue` | Root layout: toolbar + split/preview/focus panes |
| `src/stores/editor.js` | Pinia store: markdown content, file path, dirty flag, layout mode |
| `src/stores/settings.js` | Pinia store: theme (light/dark), font choice |
| `src/components/EditorPane.vue` | Textarea-based editor with line numbers |
| `src/components/PreviewPane.vue` | Rendered HTML output from marked.js + prism.js |
| `src/components/Toolbar.vue` | Formatting buttons + layout mode toggles |
| `src/components/StatusBar.vue` | Word count, cursor position, file info |
| `src/components/ThemeToggle.vue` | Light/dark toggle button |
| `src/composables/useMarkdownParser.js` | Wraps marked.js + prism.js configuration |
| `src/composables/useSyncScroll.js` | Synchronized scrolling logic |
| `src/composables/useFileOperations.js` | Open/Save/SaveAs via Tauri plugins |
| `src/composables/useKeyboardShortcuts.js` | Global keyboard shortcut registration |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `markdown-editor/` (entire scaffolded project)
- Modify: `markdown-editor/package.json` (add dependencies)
- Modify: `markdown-editor/src-tauri/tauri.conf.json` (window settings)
- Modify: `markdown-editor/src-tauri/Cargo.toml` (plugins)

- [ ] **Step 1: Create the Tauri 2 + Vue 3 project**

```bash
cd /Users/mathieu.poignant/Documents/projects/Markdown
npm create tauri-app@latest markdown-editor -- --template vue --manager npm
cd markdown-editor
```

When prompted:
- Project name: `markdown-editor`
- Frontend: `Vue`
- Package manager: `npm`

- [ ] **Step 2: Install frontend dependencies**

```bash
cd /Users/mathieu.poignant/Documents/projects/Markdown/markdown-editor
npm install
npm install marked prismjs
npm install pinia
npm install @tauri-apps/plugin-fs @tauri-apps/plugin-dialog @tauri-apps/plugin-shell
npm install @tauri-apps/api
```

- [ ] **Step 3: Add Tauri plugins to Cargo.toml**

Open `src-tauri/Cargo.toml` and add under `[dependencies]`:

```toml
tauri-plugin-fs = "2"
tauri-plugin-dialog = "2"
tauri-plugin-shell = "2"
```

- [ ] **Step 4: Register plugins in lib.rs**

Replace `src-tauri/src/lib.rs` with:

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 5: Configure window in tauri.conf.json**

In `src-tauri/tauri.conf.json`, update the `app.windows` array:

```json
{
  "app": {
    "windows": [
      {
        "title": "Markdown Editor",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "decorations": true,
        "resizable": true
      }
    ]
  }
}
```

- [ ] **Step 6: Configure plugin permissions**

Create `src-tauri/capabilities/default.json`:

```json
{
  "identifier": "default",
  "description": "Default capabilities for the app",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:default",
    "fs:allow-read-text-file",
    "fs:allow-write-text-file",
    "dialog:default",
    "dialog:allow-open",
    "dialog:allow-save",
    "shell:default"
  ]
}
```

- [ ] **Step 7: Verify the app compiles and launches**

```bash
cd /Users/mathieu.poignant/Documents/projects/Markdown/markdown-editor
npm run tauri dev
```

Expected: A window opens showing the default Vue template. Close it.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Tauri 2 + Vue 3 project with plugins"
```

---

## Task 2: Pinia Stores

**Files:**
- Create: `src/stores/editor.js`
- Create: `src/stores/settings.js`
- Modify: `src/main.js`

- [ ] **Step 1: Set up Pinia in main.js**

Replace `src/main.js`:

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

- [ ] **Step 2: Create the editor store**

Create `src/stores/editor.js`:

```javascript
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
```

- [ ] **Step 3: Create the settings store**

Create `src/stores/settings.js`:

```javascript
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
```

- [ ] **Step 4: Verify stores load without errors**

```bash
npm run tauri dev
```

Expected: App launches without console errors. Stores are registered.

- [ ] **Step 5: Commit**

```bash
git add src/stores/ src/main.js
git commit -m "feat: add Pinia editor and settings stores"
```

---

## Task 3: CSS Foundation & Theme System

**Files:**
- Create: `src/assets/styles/variables.css`
- Create: `src/assets/styles/reset.css`
- Create: `src/assets/styles/layout.css`
- Create: `src/assets/styles/themes.css`
- Modify: `src/main.js` (import styles)

- [ ] **Step 1: Create CSS variables**

Create `src/assets/styles/variables.css`:

```css
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #e9ecef;
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #495057;
  --color-text-muted: #868e96;
  --color-border: #dee2e6;
  --color-accent: #4263eb;
  --color-accent-hover: #364fc7;
  --color-surface: rgba(255, 255, 255, 0.8);
  --color-toolbar-bg: rgba(248, 249, 250, 0.85);

  --font-editor: 'JetBrains Mono', 'Fira Code', monospace;
  --font-preview: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --font-size-editor: 14px;
  --font-size-preview: 16px;
  --font-size-ui: 13px;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --toolbar-height: 44px;
  --statusbar-height: 28px;
  --divider-width: 1px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);

  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

- [ ] **Step 2: Create theme overrides**

Create `src/assets/styles/themes.css`:

```css
[data-theme='dark'] {
  --color-bg-primary: #1a1a2e;
  --color-bg-secondary: #16213e;
  --color-bg-tertiary: #0f3460;
  --color-text-primary: #e8e8e8;
  --color-text-secondary: #b0b0b0;
  --color-text-muted: #6c757d;
  --color-border: #2d3748;
  --color-accent: #748ffc;
  --color-accent-hover: #91a7ff;
  --color-surface: rgba(26, 26, 46, 0.85);
  --color-toolbar-bg: rgba(22, 33, 62, 0.9);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
}

@media (prefers-color-scheme: dark) {
  [data-theme='system'] {
    --color-bg-primary: #1a1a2e;
    --color-bg-secondary: #16213e;
    --color-bg-tertiary: #0f3460;
    --color-text-primary: #e8e8e8;
    --color-text-secondary: #b0b0b0;
    --color-text-muted: #6c757d;
    --color-border: #2d3748;
    --color-accent: #748ffc;
    --color-accent-hover: #91a7ff;
    --color-surface: rgba(26, 26, 46, 0.85);
    --color-toolbar-bg: rgba(22, 33, 62, 0.9);
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
}
```

- [ ] **Step 3: Create reset styles**

Create `src/assets/styles/reset.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: var(--font-ui);
  font-size: var(--font-size-ui);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button {
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

textarea {
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
}
```

- [ ] **Step 4: Create layout styles**

Create `src/assets/styles/layout.css`:

```css
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-bg-primary);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: var(--divider-width) solid var(--color-border);
}

.preview-pane {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
}

.layout-preview-only .editor-pane {
  display: none;
}

.layout-preview-only .preview-pane {
  border-left: none;
}

.layout-focus .preview-pane {
  display: none;
}

.layout-focus .editor-pane {
  border-right: none;
}
```

- [ ] **Step 5: Import styles in main.js**

Update `src/main.js`:

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './assets/styles/variables.css'
import './assets/styles/themes.css'
import './assets/styles/reset.css'
import './assets/styles/layout.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

- [ ] **Step 6: Verify styles load**

```bash
npm run tauri dev
```

Expected: Window opens with a dark/light background (depending on OS theme) and no visible content yet.

- [ ] **Step 7: Commit**

```bash
git add src/assets/styles/ src/main.js
git commit -m "feat: add CSS foundation with light/dark theme system"
```

---

## Task 4: App Shell & Layout Modes

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Build the App.vue shell**

Replace `src/App.vue`:

```vue
<template>
  <div
    class="app-container"
    :class="`layout-${editorStore.layoutMode}`"
    :data-theme="settingsStore.theme"
  >
    <div class="main-content">
      <div class="editor-pane">
        <textarea
          class="editor-textarea"
          :value="editorStore.content"
          @input="editorStore.setContent($event.target.value)"
          placeholder="Start writing Markdown..."
        ></textarea>
      </div>
      <div class="preview-pane">
        <div class="preview-content" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from './stores/editor'
import { useSettingsStore } from './stores/settings'

const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const renderedHtml = computed(() => {
  return `<p>${editorStore.content}</p>`
})
</script>

<style>
.editor-textarea {
  flex: 1;
  width: 100%;
  padding: var(--spacing-lg);
  font-family: var(--font-editor);
  font-size: var(--font-size-editor);
  line-height: 1.6;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  tab-size: 2;
}

.preview-content {
  font-family: var(--font-preview);
  font-size: var(--font-size-preview);
  line-height: 1.7;
  color: var(--color-text-primary);
}
</style>
```

- [ ] **Step 2: Verify layout renders**

```bash
npm run tauri dev
```

Expected: Split view with textarea on left and raw text echoed on right. Typing in the textarea shows text in the preview pane.

- [ ] **Step 3: Commit**

```bash
git add src/App.vue
git commit -m "feat: add app shell with split layout and basic text echo"
```

---

## Task 5: Markdown Parser Composable

**Files:**
- Create: `src/composables/useMarkdownParser.js`
- Modify: `src/App.vue`

- [ ] **Step 1: Create the markdown parser composable**

Create `src/composables/useMarkdownParser.js`:

```javascript
import { computed } from 'vue'
import { marked } from 'marked'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-rust'

marked.setOptions({
  breaks: true,
  gfm: true,
  highlight(code, lang) {
    if (lang && Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang)
    }
    return code
  },
})

export function useMarkdownParser(source) {
  const html = computed(() => {
    if (!source.value) return ''
    return marked.parse(source.value)
  })

  return { html }
}
```

- [ ] **Step 2: Wire parser into App.vue**

In `src/App.vue`, update the `<script setup>` block:

```vue
<script setup>
import { computed } from 'vue'
import { useEditorStore } from './stores/editor'
import { useSettingsStore } from './stores/settings'
import { useMarkdownParser } from './composables/useMarkdownParser'

const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const source = computed(() => editorStore.content)
const { html: renderedHtml } = useMarkdownParser(source)
</script>
```

- [ ] **Step 3: Add Prism CSS theme**

Create `src/assets/styles/preview.css`:

```css
.preview-content h1 {
  font-size: 2em;
  font-weight: 700;
  margin-bottom: 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--color-border);
}

.preview-content h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 1.2em;
  margin-bottom: 0.4em;
}

.preview-content h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.3em;
}

.preview-content p {
  margin-bottom: 1em;
}

.preview-content code {
  font-family: var(--font-editor);
  font-size: 0.9em;
  padding: 2px 6px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
}

.preview-content pre {
  padding: var(--spacing-md);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin-bottom: 1em;
}

.preview-content pre code {
  padding: 0;
  background: none;
}

.preview-content blockquote {
  border-left: 4px solid var(--color-accent);
  padding-left: var(--spacing-md);
  color: var(--color-text-secondary);
  margin-bottom: 1em;
}

.preview-content ul,
.preview-content ol {
  padding-left: var(--spacing-lg);
  margin-bottom: 1em;
}

.preview-content li {
  margin-bottom: 0.3em;
}

.preview-content a {
  color: var(--color-accent);
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

.preview-content img {
  max-width: 100%;
  border-radius: var(--radius-md);
}

.preview-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}

.preview-content th,
.preview-content td {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  text-align: left;
}

.preview-content th {
  background-color: var(--color-bg-tertiary);
  font-weight: 600;
}

.preview-content hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--spacing-lg) 0;
}
```

- [ ] **Step 4: Import preview.css in main.js**

Add to `src/main.js` imports:

```javascript
import './assets/styles/preview.css'
```

- [ ] **Step 5: Verify Markdown rendering**

```bash
npm run tauri dev
```

Type the following in the editor and confirm it renders correctly:

```
# Hello World

This is **bold** and *italic*.

```javascript
const x = 42;
```

- A list item
- Another item
```

Expected: Headings, bold/italic, code blocks with syntax highlighting, and lists render correctly in the preview pane.

- [ ] **Step 6: Commit**

```bash
git add src/composables/useMarkdownParser.js src/App.vue src/assets/styles/preview.css src/main.js
git commit -m "feat: add live Markdown parsing with marked.js and Prism.js"
```

---

## Task 6: Editor Pane Component

**Files:**
- Create: `src/components/EditorPane.vue`
- Create: `src/assets/styles/editor.css`
- Modify: `src/App.vue`
- Modify: `src/main.js`

- [ ] **Step 1: Create the editor component**

Create `src/components/EditorPane.vue`:

```vue
<template>
  <div class="editor-wrapper">
    <textarea
      ref="textareaRef"
      class="editor-textarea"
      :value="editorStore.content"
      :style="{ fontFamily: settingsStore.editorFont }"
      @input="onInput"
      @scroll="$emit('scroll', $event)"
      @keydown.tab.prevent="onTab"
      placeholder="Start writing Markdown..."
      spellcheck="false"
    ></textarea>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEditorStore } from '../stores/editor'
import { useSettingsStore } from '../stores/settings'

const emit = defineEmits(['scroll'])
const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const textareaRef = ref(null)

function onInput(event) {
  editorStore.setContent(event.target.value)
}

function onTab(event) {
  const textarea = event.target
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value

  const newValue = value.substring(0, start) + '  ' + value.substring(end)
  editorStore.setContent(newValue)

  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 2
  })
}

function insertText(before, after = '') {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.substring(start, end)
  const replacement = before + selected + after

  const newValue =
    textarea.value.substring(0, start) + replacement + textarea.value.substring(end)
  editorStore.setContent(newValue)

  nextTick(() => {
    textarea.selectionStart = start + before.length
    textarea.selectionEnd = start + before.length + selected.length
    textarea.focus()
  })
}

import { nextTick } from 'vue'

defineExpose({ textareaRef, insertText })
</script>
```

- [ ] **Step 2: Create editor styles**

Create `src/assets/styles/editor.css`:

```css
.editor-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  padding: var(--spacing-lg);
  font-family: var(--font-editor);
  font-size: var(--font-size-editor);
  line-height: 1.6;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  tab-size: 2;
  overflow-y: auto;
}

.editor-textarea::placeholder {
  color: var(--color-text-muted);
}

.editor-textarea:focus {
  outline: none;
}
```

- [ ] **Step 3: Import editor.css in main.js**

Add to `src/main.js`:

```javascript
import './assets/styles/editor.css'
```

- [ ] **Step 4: Update App.vue to use EditorPane**

Update `src/App.vue`:

```vue
<template>
  <div
    class="app-container"
    :class="`layout-${editorStore.layoutMode}`"
    :data-theme="settingsStore.theme"
  >
    <div class="main-content">
      <div class="editor-pane">
        <EditorPane ref="editorRef" @scroll="onEditorScroll" />
      </div>
      <div class="preview-pane" ref="previewRef">
        <div class="preview-content" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from './stores/editor'
import { useSettingsStore } from './stores/settings'
import { useMarkdownParser } from './composables/useMarkdownParser'
import EditorPane from './components/EditorPane.vue'

const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const source = computed(() => editorStore.content)
const { html: renderedHtml } = useMarkdownParser(source)

const editorRef = ref(null)
const previewRef = ref(null)

function onEditorScroll(event) {
  // Sync scroll handled in Task 8
}
</script>

<style>
/* Inline styles removed — now in separate CSS files */
</style>
```

- [ ] **Step 5: Verify editor component works**

```bash
npm run tauri dev
```

Expected: Editor still works, text renders in preview. Tab key inserts two spaces.

- [ ] **Step 6: Commit**

```bash
git add src/components/EditorPane.vue src/assets/styles/editor.css src/App.vue src/main.js
git commit -m "feat: extract EditorPane component with tab support"
```

---

## Task 7: Preview Pane Component

**Files:**
- Create: `src/components/PreviewPane.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Create the PreviewPane component**

Create `src/components/PreviewPane.vue`:

```vue
<template>
  <div
    class="preview-wrapper"
    ref="wrapperRef"
    :style="{ fontFamily: settingsStore.previewFont }"
    @scroll="$emit('scroll', $event)"
  >
    <div class="preview-content" v-html="html"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings'

defineProps({
  html: {
    type: String,
    default: '',
  },
})

defineEmits(['scroll'])
const settingsStore = useSettingsStore()
const wrapperRef = ref(null)

defineExpose({ wrapperRef })
</script>

<style>
.preview-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
}
</style>
```

- [ ] **Step 2: Update App.vue to use PreviewPane**

In `src/App.vue`, update template and script:

```vue
<template>
  <div
    class="app-container"
    :class="`layout-${editorStore.layoutMode}`"
    :data-theme="settingsStore.theme"
  >
    <div class="main-content">
      <div class="editor-pane">
        <EditorPane ref="editorRef" @scroll="onEditorScroll" />
      </div>
      <PreviewPane ref="previewRef" :html="renderedHtml" @scroll="onPreviewScroll" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from './stores/editor'
import { useSettingsStore } from './stores/settings'
import { useMarkdownParser } from './composables/useMarkdownParser'
import EditorPane from './components/EditorPane.vue'
import PreviewPane from './components/PreviewPane.vue'

const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const source = computed(() => editorStore.content)
const { html: renderedHtml } = useMarkdownParser(source)

const editorRef = ref(null)
const previewRef = ref(null)

function onEditorScroll(event) {
  // Sync scroll handled in Task 8
}

function onPreviewScroll(event) {
  // Sync scroll handled in Task 8
}
</script>
```

- [ ] **Step 3: Verify preview component works**

```bash
npm run tauri dev
```

Expected: Same rendering behavior as before, but now using the extracted PreviewPane component.

- [ ] **Step 4: Commit**

```bash
git add src/components/PreviewPane.vue src/App.vue
git commit -m "feat: extract PreviewPane component"
```

---

## Task 8: Synchronized Scrolling

**Files:**
- Create: `src/composables/useSyncScroll.js`
- Modify: `src/App.vue`

- [ ] **Step 1: Create the sync scroll composable**

Create `src/composables/useSyncScroll.js`:

```javascript
import { ref } from 'vue'

export function useSyncScroll() {
  const isSyncing = ref(false)

  function syncScroll(sourceEl, targetEl) {
    if (isSyncing.value) return
    if (!sourceEl || !targetEl) return

    isSyncing.value = true

    const sourceScrollRatio =
      sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight || 1)

    targetEl.scrollTop =
      sourceScrollRatio * (targetEl.scrollHeight - targetEl.clientHeight)

    requestAnimationFrame(() => {
      isSyncing.value = false
    })
  }

  return { syncScroll }
}
```

- [ ] **Step 2: Wire sync scroll into App.vue**

Update the `<script setup>` in `src/App.vue`:

```vue
<script setup>
import { ref, computed } from 'vue'
import { useEditorStore } from './stores/editor'
import { useSettingsStore } from './stores/settings'
import { useMarkdownParser } from './composables/useMarkdownParser'
import { useSyncScroll } from './composables/useSyncScroll'
import EditorPane from './components/EditorPane.vue'
import PreviewPane from './components/PreviewPane.vue'

const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const source = computed(() => editorStore.content)
const { html: renderedHtml } = useMarkdownParser(source)

const editorRef = ref(null)
const previewRef = ref(null)
const { syncScroll } = useSyncScroll()

function onEditorScroll(event) {
  const editorEl = event.target
  const previewEl = previewRef.value?.wrapperRef
  syncScroll(editorEl, previewEl)
}

function onPreviewScroll(event) {
  const previewEl = event.target
  const editorEl = editorRef.value?.textareaRef
  syncScroll(previewEl, editorEl)
}
</script>
```

- [ ] **Step 3: Verify synchronized scrolling**

```bash
npm run tauri dev
```

Paste a long Markdown document in the editor. Scroll the editor — preview should follow. Scroll the preview — editor should follow.

- [ ] **Step 4: Commit**

```bash
git add src/composables/useSyncScroll.js src/App.vue
git commit -m "feat: add synchronized scrolling between editor and preview"
```

---

## Task 9: File Operations Composable

**Files:**
- Create: `src/composables/useFileOperations.js`

- [ ] **Step 1: Create the file operations composable**

Create `src/composables/useFileOperations.js`:

```javascript
import { open, save } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEditorStore } from '../stores/editor'

export function useFileOperations() {
  const editorStore = useEditorStore()

  async function updateWindowTitle() {
    const window = getCurrentWindow()
    await window.setTitle(editorStore.windowTitle)
  }

  async function newFile() {
    if (editorStore.isDirty) {
      const confirmed = confirm('Discard unsaved changes?')
      if (!confirmed) return
    }
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
    editorStore.filePath = path
    editorStore.markSaved()
    await updateWindowTitle()
  }

  return { newFile, openFile, saveFile, saveFileAs, updateWindowTitle }
}
```

- [ ] **Step 2: Verify file operations compile**

```bash
npm run tauri dev
```

Expected: App launches without errors. (We'll wire these into the toolbar and keyboard shortcuts in later tasks.)

- [ ] **Step 3: Commit**

```bash
git add src/composables/useFileOperations.js
git commit -m "feat: add file operations composable (open, save, save-as)"
```

---

## Task 10: Keyboard Shortcuts

**Files:**
- Create: `src/composables/useKeyboardShortcuts.js`
- Modify: `src/App.vue`

- [ ] **Step 1: Create the keyboard shortcuts composable**

Create `src/composables/useKeyboardShortcuts.js`:

```javascript
import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts(actions) {
  function handler(event) {
    const mod = event.metaKey || event.ctrlKey

    if (mod && event.key === 's') {
      event.preventDefault()
      actions.save()
    } else if (mod && event.key === 'o') {
      event.preventDefault()
      actions.open()
    } else if (mod && event.key === 'n') {
      event.preventDefault()
      actions.new()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handler)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handler)
  })
}
```

- [ ] **Step 2: Wire shortcuts into App.vue**

Add to `src/App.vue` `<script setup>`:

```javascript
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { useFileOperations } from './composables/useFileOperations'

const { newFile, openFile, saveFile } = useFileOperations()

useKeyboardShortcuts({
  save: saveFile,
  open: openFile,
  new: newFile,
})
```

- [ ] **Step 3: Verify keyboard shortcuts**

```bash
npm run tauri dev
```

Test:
- `Cmd+S` should trigger save dialog (since no file is open yet, it goes to "Save As")
- `Cmd+O` should open a file picker
- `Cmd+N` should clear the editor

- [ ] **Step 4: Commit**

```bash
git add src/composables/useKeyboardShortcuts.js src/App.vue
git commit -m "feat: add global keyboard shortcuts (Cmd+S, Cmd+O, Cmd+N)"
```

---

## Task 11: Toolbar Component

**Files:**
- Create: `src/components/Toolbar.vue`
- Create: `src/assets/styles/toolbar.css`
- Modify: `src/App.vue`
- Modify: `src/main.js`

- [ ] **Step 1: Create toolbar styles**

Create `src/assets/styles/toolbar.css`:

```css
.toolbar {
  display: flex;
  align-items: center;
  height: var(--toolbar-height);
  padding: 0 var(--spacing-md);
  background-color: var(--color-toolbar-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  gap: var(--spacing-xs);
  -webkit-app-region: drag;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
  -webkit-app-region: no-drag;
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background-color: var(--color-border);
  margin: 0 var(--spacing-sm);
}

.toolbar-spacer {
  flex: 1;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
  font-weight: 600;
  font-size: 13px;
}

.toolbar-btn:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.toolbar-btn.active {
  background-color: var(--color-accent);
  color: #ffffff;
}

.toolbar-btn-wide {
  width: auto;
  padding: 0 var(--spacing-sm);
  font-size: 12px;
  font-weight: 500;
}
```

- [ ] **Step 2: Create the Toolbar component**

Create `src/components/Toolbar.vue`:

```vue
<template>
  <div class="toolbar">
    <div class="toolbar-group">
      <button class="toolbar-btn" title="Bold (Cmd+B)" @click="format('bold')">B</button>
      <button class="toolbar-btn" title="Italic (Cmd+I)" @click="format('italic')">
        <em>I</em>
      </button>
      <button class="toolbar-btn" title="Heading" @click="format('heading')">H</button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn toolbar-btn-wide" title="List" @click="format('list')">
        List
      </button>
      <button class="toolbar-btn toolbar-btn-wide" title="Link" @click="format('link')">
        Link
      </button>
      <button class="toolbar-btn toolbar-btn-wide" title="Code" @click="format('code')">
        Code
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
```

- [ ] **Step 3: Import toolbar.css in main.js**

Add to `src/main.js`:

```javascript
import './assets/styles/toolbar.css'
```

- [ ] **Step 4: Wire Toolbar into App.vue**

Update `src/App.vue` template to include toolbar:

```vue
<template>
  <div
    class="app-container"
    :class="`layout-${editorStore.layoutMode}`"
    :data-theme="settingsStore.theme"
  >
    <Toolbar @format="onFormat" />
    <div class="main-content">
      <div class="editor-pane">
        <EditorPane ref="editorRef" @scroll="onEditorScroll" />
      </div>
      <PreviewPane ref="previewRef" :html="renderedHtml" @scroll="onPreviewScroll" />
    </div>
  </div>
</template>
```

Add the `onFormat` handler in `<script setup>`:

```javascript
import Toolbar from './components/Toolbar.vue'

function onFormat(type) {
  const editor = editorRef.value
  if (!editor) return

  const formats = {
    bold: { before: '**', after: '**' },
    italic: { before: '_', after: '_' },
    heading: { before: '## ', after: '' },
    list: { before: '- ', after: '' },
    link: { before: '[', after: '](url)' },
    code: { before: '`', after: '`' },
  }

  const fmt = formats[type]
  if (fmt) {
    editor.insertText(fmt.before, fmt.after)
  }
}
```

- [ ] **Step 5: Verify toolbar functionality**

```bash
npm run tauri dev
```

Test:
- Click formatting buttons — they insert Markdown syntax
- Layout toggle buttons switch between Split, Preview Only, and Focus modes
- Theme button cycles through Auto/Light/Dark

- [ ] **Step 6: Commit**

```bash
git add src/components/Toolbar.vue src/assets/styles/toolbar.css src/App.vue src/main.js
git commit -m "feat: add toolbar with formatting, layout modes, and theme toggle"
```

---

## Task 12: Status Bar

**Files:**
- Create: `src/components/StatusBar.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Create the StatusBar component**

Create `src/components/StatusBar.vue`:

```vue
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
```

- [ ] **Step 2: Add StatusBar to App.vue**

Update `src/App.vue` template:

```vue
<template>
  <div
    class="app-container"
    :class="`layout-${editorStore.layoutMode}`"
    :data-theme="settingsStore.theme"
  >
    <Toolbar @format="onFormat" />
    <div class="main-content">
      <div class="editor-pane">
        <EditorPane ref="editorRef" @scroll="onEditorScroll" />
      </div>
      <PreviewPane ref="previewRef" :html="renderedHtml" @scroll="onPreviewScroll" />
    </div>
    <StatusBar />
  </div>
</template>
```

Add the import:

```javascript
import StatusBar from './components/StatusBar.vue'
```

- [ ] **Step 3: Verify status bar**

```bash
npm run tauri dev
```

Expected: A thin bar at the bottom showing word count, character count, filename, and "Modified" indicator when content changes.

- [ ] **Step 4: Commit**

```bash
git add src/components/StatusBar.vue src/App.vue
git commit -m "feat: add status bar with word count and dirty indicator"
```

---

## Task 13: Window Title Integration

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Watch editor state and update window title**

In `src/App.vue` `<script setup>`, add a watcher for the window title:

```javascript
import { ref, computed, watch } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'

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
```

- [ ] **Step 2: Verify title updates**

```bash
npm run tauri dev
```

Test:
- Open the app — title should say "Untitled — Markdown Editor"
- Type something — title should change to "* Untitled — Markdown Editor"
- Save the file — asterisk disappears, filename appears

- [ ] **Step 3: Commit**

```bash
git add src/App.vue
git commit -m "feat: update window title with filename and dirty state"
```

---

## Task 14: Font Customization

**Files:**
- Modify: `src/stores/settings.js`
- Modify: `src/components/Toolbar.vue`
- Modify: `index.html`

- [ ] **Step 1: Add Google Fonts to index.html**

In `index.html`, add inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Source+Code+Pro:wght@400;500&family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add font selector to Toolbar**

In `src/components/Toolbar.vue`, add a font selector group before the theme button:

Add to the template (before `toolbar-spacer`):

```vue
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
```

Add this CSS (append to `src/assets/styles/toolbar.css`):

```css
.toolbar-select {
  height: 28px;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 11px;
  font-family: var(--font-ui);
  -webkit-app-region: no-drag;
  cursor: pointer;
}

.toolbar-select:focus {
  outline: none;
  border-color: var(--color-accent);
}
```

- [ ] **Step 3: Verify font switching**

```bash
npm run tauri dev
```

Expected: Dropdown in toolbar lets you switch between JetBrains Mono, Fira Code, and Source Code Pro. The editor font changes immediately.

- [ ] **Step 4: Commit**

```bash
git add index.html src/components/Toolbar.vue src/assets/styles/toolbar.css
git commit -m "feat: add customizable editor font selection"
```

---

## Task 15: Polish & Final Integration

**Files:**
- Modify: `src/App.vue` (final assembly)
- Modify: `src/assets/styles/layout.css` (transitions)

- [ ] **Step 1: Add layout transitions**

Add to `src/assets/styles/layout.css`:

```css
.editor-pane,
.preview-wrapper {
  transition: flex var(--transition-normal), opacity var(--transition-normal);
}

.main-content {
  position: relative;
}
```

- [ ] **Step 2: Add drag region to toolbar for native window dragging**

The toolbar already has `-webkit-app-region: drag` in `toolbar.css`. Verify that clicking and dragging on the empty space of the toolbar moves the window.

- [ ] **Step 3: Final App.vue assembly**

Ensure `src/App.vue` has all imports and handlers wired up. Here is the complete final version:

```vue
<template>
  <div
    class="app-container"
    :class="`layout-${editorStore.layoutMode}`"
    :data-theme="settingsStore.theme"
  >
    <Toolbar @format="onFormat" />
    <div class="main-content">
      <div class="editor-pane">
        <EditorPane ref="editorRef" @scroll="onEditorScroll" />
      </div>
      <PreviewPane ref="previewRef" :html="renderedHtml" @scroll="onPreviewScroll" />
    </div>
    <StatusBar />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEditorStore } from './stores/editor'
import { useSettingsStore } from './stores/settings'
import { useMarkdownParser } from './composables/useMarkdownParser'
import { useSyncScroll } from './composables/useSyncScroll'
import { useFileOperations } from './composables/useFileOperations'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import Toolbar from './components/Toolbar.vue'
import EditorPane from './components/EditorPane.vue'
import PreviewPane from './components/PreviewPane.vue'
import StatusBar from './components/StatusBar.vue'

const editorStore = useEditorStore()
const settingsStore = useSettingsStore()

const source = computed(() => editorStore.content)
const { html: renderedHtml } = useMarkdownParser(source)

const editorRef = ref(null)
const previewRef = ref(null)
const { syncScroll } = useSyncScroll()

const { newFile, openFile, saveFile } = useFileOperations()

useKeyboardShortcuts({
  save: saveFile,
  open: openFile,
  new: newFile,
})

function onEditorScroll(event) {
  const editorEl = event.target
  const previewEl = previewRef.value?.wrapperRef
  syncScroll(editorEl, previewEl)
}

function onPreviewScroll(event) {
  const previewEl = event.target
  const editorEl = editorRef.value?.textareaRef
  syncScroll(previewEl, editorEl)
}

function onFormat(type) {
  const editor = editorRef.value
  if (!editor) return

  const formats = {
    bold: { before: '**', after: '**' },
    italic: { before: '_', after: '_' },
    heading: { before: '## ', after: '' },
    list: { before: '- ', after: '' },
    link: { before: '[', after: '](url)' },
    code: { before: '`', after: '`' },
  }

  const fmt = formats[type]
  if (fmt) {
    editor.insertText(fmt.before, fmt.after)
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
```

- [ ] **Step 4: Full end-to-end test**

```bash
npm run tauri dev
```

Test the following:
1. Type Markdown — preview renders in real-time
2. Scroll editor — preview follows
3. Click formatting buttons — Markdown syntax inserted
4. Switch layout modes (Split / Preview / Focus)
5. Toggle theme (Auto / Light / Dark)
6. `Cmd+O` — open a `.md` file
7. `Cmd+S` — save the file
8. `Cmd+N` — new file (with dirty check)
9. Window title reflects filename and dirty state
10. Status bar shows word/char count
11. Font selector changes editor font

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: final polish — transitions, window dragging, complete integration"
```

---

## Task 16: Build & Package

**Files:**
- Modify: `src-tauri/tauri.conf.json` (bundle metadata)

- [ ] **Step 1: Configure bundle metadata**

In `src-tauri/tauri.conf.json`, add/update the `bundle` section:

```json
{
  "bundle": {
    "active": true,
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "identifier": "com.markdown-editor.app",
    "targets": "all"
  }
}
```

- [ ] **Step 2: Generate app icons**

```bash
cd /Users/mathieu.poignant/Documents/projects/Markdown/markdown-editor
npm run tauri icon src-tauri/icons/icon.png
```

(If no source icon exists, the default Tauri icon is used. Replace later with a custom icon.)

- [ ] **Step 3: Build the production app**

```bash
npm run tauri build
```

Expected: A `.dmg` (macOS), `.msi` (Windows), or `.AppImage`/`.deb` (Linux) is created in `src-tauri/target/release/bundle/`.

- [ ] **Step 4: Launch the built app and verify**

Open the generated `.dmg` or app binary and verify it works as expected — all features functional without dev server.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/tauri.conf.json
git commit -m "feat: configure build and packaging for cross-platform distribution"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Project Scaffolding | Project root, Cargo.toml, tauri.conf.json |
| 2 | Pinia Stores | stores/editor.js, stores/settings.js |
| 3 | CSS Foundation & Themes | assets/styles/*.css |
| 4 | App Shell & Layout | App.vue |
| 5 | Markdown Parser | composables/useMarkdownParser.js |
| 6 | Editor Pane Component | components/EditorPane.vue |
| 7 | Preview Pane Component | components/PreviewPane.vue |
| 8 | Synchronized Scrolling | composables/useSyncScroll.js |
| 9 | File Operations | composables/useFileOperations.js |
| 10 | Keyboard Shortcuts | composables/useKeyboardShortcuts.js |
| 11 | Toolbar | components/Toolbar.vue |
| 12 | Status Bar | components/StatusBar.vue |
| 13 | Window Title | App.vue (watcher) |
| 14 | Font Customization | index.html, Toolbar.vue |
| 15 | Polish & Integration | Final App.vue, transitions |
| 16 | Build & Package | tauri.conf.json (bundle) |
