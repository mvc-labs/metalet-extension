<script setup lang="ts">
const { value, content } = defineProps<{
  value: number
  content: string
  contentSummary: string
  contentType: 'utf-8' | 'image/jpeg' | string
}>()
</script>

<template>
  <div
    class="flex items-center justify-center rounded-md xs:p-2 bg-[#F5F5F5] relative aspect-square w-full overflow-hidden"
  >
    <img :src="content" :alt="contentSummary" v-if="contentType === 'image/jpeg'" class="w-full h-full" />
    <div
      v-else
      :title="contentSummary"
      class="text-xs overflow-hidden line-clamp-4 scale-75 xs:scale-100 sm:line-clamp-5 md:line-clamp-6 break-all"
    >
      {{ contentSummary }}
    </div>
    <span
      :title="`${value} sat`"
      class="absolute rounded right-0 bottom-1 py-3px px-1.5 bg-[#EBECFF] text-[#787FFF] text-xs scale-75"
      >{{ value }} sat</span
    >
  </div>
</template>

<style lang="css" scoped></style>
