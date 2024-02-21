<script setup lang="ts">
import { ref } from 'vue'
import { ordinalsApi } from '@/queries/request'

const { ordinalsUrl } = defineProps<{
  value: number
  ordinalsUrl: string
}>()

const content = ref('')

ordinalsApi(ordinalsUrl)
  .get()
  .then((data: string) => {
    content.value = data
  })
</script>

<template>
  <div class="flex items-center justify-center rounded-md p-1 bg-[#F5F5F5] relative h-[95px] w-full">
    <div class="text-black-primary text-xs break-all scale-75">{{ content }}</div>
    <span
      class="absolute rounded right-0 bottom-1 py-3px px-1.5 bg-[#EBECFF] text-[#787FFF] text-xs scale-75"
      >{{ value }} sat</span
    >
  </div>
</template>

<style lang="css" scoped></style>
