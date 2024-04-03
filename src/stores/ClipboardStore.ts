import { reactive } from 'vue'

export const ClipboardStore = reactive({
  copiedText: '',
  copy: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      ClipboardStore.copiedText = text
    } catch (error) {
      console.error('复制失败:', error)
    }
  },
})
