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
  <div class="flex items-center justify-center rounded-md p-2 bg-[#1E2BFF] relative h-24 w-24">
    <div class="text-white truncate">{{ content }}</div>
    <span class="absolute rounded right-1 bottom-1 py-3px px-1.5 bg-[rgb(235,236,255,0.2)] text-[#EBECFF] text-xs">{{ value }} sat</span>
  </div>
</template>

<style lang="less" scoped></style>
