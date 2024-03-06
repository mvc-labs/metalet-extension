<script setup lang="ts">
import LoadingIcon from '@/assets/icons-v3/loading.svg'
const { ticker, amount, inscriptionNumber } = defineProps<{
  ticker: string
  amount: string | number
  inscriptionNumber?: number
}>()
</script>

<template>
  <div class="flex flex-col items-center rounded-md aspect-square bg-gray-secondary pt-2 relative">
    <div class="text-gray-primary text-sm">{{ ticker }}</div>
    <div class="mt-[9px] text-lg truncate">{{ amount }}</div>
    <div class="text-white text-xs absolute bottom-0 w-full text-center h-[25px] leading-[25px]">
      <div
        v-if="inscriptionNumber === undefined || inscriptionNumber === -1"
        class="flex items-center justify-center gap-x-1 bg-orange-primary rounded-b-md"
      >
        <svg
          class="animate-spin h-3 w-3 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>Confirmed</span>
      </div>
      <div class="bg-blue-primary rounded-b-md" v-else>#{{ inscriptionNumber }}</div>
    </div>
  </div>
</template>

<style scoped lang="css"></style>
