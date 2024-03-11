<script setup lang="ts">
type PixelValue = `${number}px`

const { d, jc } = defineProps<{
  d?: 'row' | 'col' | 'row-reverse' | 'column-reverse'
  ai?: 'start' | 'center' | 'end'
  jc?: 'start' | 'center' | 'end' | 'between' | 'around'
  gap?: number | PixelValue
}>()
</script>

<template>
  <div
    :class="[
      'flex',
      [undefined, 'row'].includes(d) ? 'flex-row' : 'flex-col',
      ai ? `items-${ai}` : undefined,
      jc ? `justify-${jc}` : undefined,
      gap ? (typeof gap === 'number' ? `gap-${gap}` : typeof gap === 'string' ? `gap-[${gap}]` : undefined) : undefined,
    ]"
  >
    <slot></slot>
  </div>
</template>

<style scoped lang="css"></style>
