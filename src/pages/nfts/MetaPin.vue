<script setup lang="ts">
const { value, content } = defineProps<{
  value: number
  content: string
  contentType: 'utf-8' | 'image/jpeg' | string
}>()
</script>

<template>
  <div
    class="flex items-center justify-center rounded-md p-2 bg-[#F5F5F5] relative aspect-square w-full overflow-hidden"
  >
    <img :src="`https://man-test.metaid.io${content}`" alt="" v-if="contentType === 'image/jpeg'"  class="w-full h-full"/>
    <div class="text-xs overflow-hidden line-clamp-6 break-all" :title="content" v-else>
      {{ content }}
    </div>
    <span class="absolute rounded right-0 bottom-1 py-3px px-1.5 bg-[#EBECFF] text-[#787FFF] text-xs scale-75"
      >{{ value }} sat</span
    >
  </div>
</template>

<style lang="css" scoped></style>
