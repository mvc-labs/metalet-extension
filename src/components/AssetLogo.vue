<script setup lang="ts">
import { type Chain } from '@/lib/account'
import BTCNetworkLogo from '@/assets/icons-v3/network_btc.svg'
import MVCNetworkLogo from '@/assets/icons-v3/network_mvc.svg'
import IncomeLogo from '@/assets/icons-v3/income.svg'
import ExpenseLogo from '@/assets/icons-v3/expense.svg'

const { logo, chain, symbol } = defineProps<{
  logo?: string
  chain?: Chain
  symbol: string
  type: 'network' | 'activity'
}>()
</script>

<template>
  <div class="h-15 w-15 relative">
    <img v-if="logo" :src="logo" :alt="symbol" class="w-full" />
    <div v-else class="leading-15 rounded-full text-center text-white text-3xl bg-blue-primary">
      {{ symbol[0].toLocaleUpperCase() }}
    </div>

    <template v-if="type === 'network'">
      <BTCNetworkLogo v-if="chain === 'btc'" class="absolute bottom-0 right-0" />
      <MVCNetworkLogo v-else-if="chain === 'mvc'" class="absolute bottom-0 right-0" />
    </template>
    <template v-else-if="type === 'activity'">
      <IncomeLogo v-if="chain === 'btc'" class="absolute bottom-0 right-0" />
      <ExpenseLogo v-else-if="chain === 'mvc'" class="absolute bottom-0 right-0" />
    </template>
  </div>
</template>

<style scoped lang="css"></style>
