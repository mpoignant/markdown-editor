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
    } else if (mod && event.key === 't') {
      event.preventDefault()
      actions.newTab()
    } else if (mod && event.key === 'w') {
      event.preventDefault()
      actions.closeTab()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handler, true)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handler, true)
  })
}
