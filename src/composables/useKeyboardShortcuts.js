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
