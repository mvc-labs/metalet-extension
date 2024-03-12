<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { ToastViewport, type ToastViewportProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<ToastViewportProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <ToastViewport v-bind="delegatedProps" :class="cn('fixed top-2 z-[100] w-82 left-1/2 -translate-x-1/2', props.class)" />
</template>
