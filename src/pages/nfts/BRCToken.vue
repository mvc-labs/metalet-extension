<script setup lang="ts">
const { contentBody, value } = defineProps<{
  value: number
  contentBody: string
}>()
</script>

<template>
  <div class="flex items-center justify-center rounded-md p-1 bg-[#F5F5F5] relative aspect-square w-full">
    <div class="text-black-primary text-xs break-all scale-75">{{ contentBody }}</div>
    <span class="absolute rounded right-0 bottom-1 py-3px px-1.5 bg-[#EBECFF] text-[#787FFF] text-xs scale-75"
      >{{ value }} sats</span
    >
  </div>
</template>

<style lang="css" scoped></style>
