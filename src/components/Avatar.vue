<script setup lang="ts">
import { computed } from 'vue'

const { id } = defineProps<{
  id: string
}>()

const colors = [
  'from-blue-100 to-blue-500',
  'from-green-100 to-green-500',
  'from-yellow-100 to-yellow-500',
  'from-red-100 to-red-500',
  'from-pink-100 to-pink-500',
  'from-purple-100 to-purple-500',
  'from-indigo-100 to-indigo-500',
]

const computedGradientColor = computed(() => {
  const index = Math.abs(id.split('').reduce((prev, curr) => prev + curr.charCodeAt(0), 0)) % colors.length

  return colors[index]
})
</script>

<!-- Avatar.vue -->
<template>
  <div :class="['h-9 w-9 shrink-0 rounded-full bg-gradient-to-br', computedGradientColor]"></div>
</template>
