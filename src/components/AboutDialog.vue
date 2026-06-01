<template>
  <div v-if="visible" class="about-overlay" @click.self="close">
    <div class="about-dialog">
      <img src="/icon.png" alt="Markdown Live" class="about-icon" />
      <h1 class="about-title">Markdown Live</h1>
      <p class="about-version">Version 1.0.0</p>
      <p class="about-description">
        A cross-platform desktop Markdown editor with split-screen live preview,
        native file system integration, and light/dark themes.
      </p>
      <div class="about-details">
        <p><strong>Author:</strong> Mathieu Poignant</p>
        <p><strong>License:</strong> GPL v3</p>
        <p>
          <strong>Source:</strong>
          <a href="#" @click.prevent="openGitHub">github.com/mpoignant/markdown-editor</a>
        </p>
      </div>
      <div class="about-credits">
        <p class="about-credits-title">Built with</p>
        <p>Tauri 2 · Vue.js 3 · CodeMirror 6 · marked.js</p>
      </div>
      <button class="about-close" @click="close">OK</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { open as shellOpen } from '@tauri-apps/plugin-shell'

const visible = ref(false)

function show() {
  visible.value = true
}

function close() {
  visible.value = false
}

async function openGitHub() {
  try {
    await shellOpen('https://github.com/mpoignant/markdown-editor')
  } catch (e) {
    window.open('https://github.com/mpoignant/markdown-editor', '_blank')
  }
}

defineExpose({ show })
</script>

<style>
.about-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.about-dialog {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 380px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.about-icon {
  width: 80px;
  height: 80px;
  margin-bottom: var(--spacing-md);
}

.about-title {
  font-family: var(--font-ui);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}

.about-version {
  font-family: var(--font-ui);
  font-size: var(--font-size-ui);
  color: var(--color-text-muted);
  margin: 0 0 var(--spacing-md);
}

.about-description {
  font-family: var(--font-ui);
  font-size: var(--font-size-ui);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 var(--spacing-md);
}

.about-details {
  font-family: var(--font-ui);
  font-size: var(--font-size-ui);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md);
  line-height: 1.8;
}

.about-details p {
  margin: 0;
}

.about-details a {
  color: var(--color-accent);
  text-decoration: none;
}

.about-details a:hover {
  text-decoration: underline;
}

.about-credits {
  font-family: var(--font-ui);
  font-size: 11px;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.about-credits-title {
  margin: 0 0 var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.about-credits p {
  margin: 0;
}

.about-close {
  font-family: var(--font-ui);
  font-size: var(--font-size-ui);
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-lg);
  cursor: pointer;
  font-weight: 500;
}

.about-close:hover {
  background: var(--color-accent-hover);
}
</style>
