<script setup lang="ts">
import LoadingIcon from '@/assets/icons-v3/loading.svg'
const { ticker, amount, inscriptionNumber } = defineProps<{
  ticker: string
  amount: string | number
  inscriptionNumber?: number
  block?: boolean
}>()
</script>

<template>
  <div class="flex flex-col items-center rounded-md aspect-square bg-gray-secondary pt-2 relative">
    <div class="text-gray-primary text-sm">{{ ticker }}</div>
    <div class="mt-[9px] text-lg truncate w-full px-1 text-center" :title="`${amount} ${ticker}`">{{ amount }}</div>
    <div class="text-white text-xs absolute bottom-0 w-full text-center h-[25px] leading-[25px]">
      <div v-if="block" class="bg-blue-primary rounded-b-md">Block</div>
      <div
        v-else-if="inscriptionNumber === undefined || inscriptionNumber === -1"
        class="flex items-center justify-center gap-x-1 bg-orange-primary rounded-b-md"
      >
        <LoadingIcon />
        <span>Confirmed</span>
      </div>
      <div class="bg-blue-primary rounded-b-md" v-else>#{{ inscriptionNumber }}</div>
    </div>
  </div>
</template>

<style scoped lang="css"></style>
