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
