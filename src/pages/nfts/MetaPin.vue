<script setup lang="ts">
const { value, content } = defineProps<{
  value: number
  content: string
}>()
</script>

<template>
  <div class="flex items-center justify-center rounded-md p-1 bg-[#F5F5F5] relative h-[95px] w-full">
    <div
      class="text-[#141416] text-xs break-all scale-75 h-[75%] flex items-center justify-center text-center w-full overflow-hidden"
      :title="content">{{ content }}</div>
    <span class="absolute rounded right-0 bottom-1 py-3px px-1.5 bg-[#EBECFF] text-[#787FFF] text-xs scale-75">{{ value }}
      sat</span>
  </div>
</template>

<style lang="css" scoped></style>
