<script setup lang="ts">
import { type Chain } from '@/lib/account'
import BTCNetworkLogo from '@/assets/icons-v3/network_btc.svg'
import MVCNetworkLogo from '@/assets/icons-v3/network_mvc.svg'
import IncomeLogo from '@/assets/icons-v3/income.svg'
import ExpenseLogo from '@/assets/icons-v3/expense.svg'
import FlexBox from './FlexBox.vue'

const { logo, chain, symbol } = defineProps<{
  logo?: string
  chain?: Chain
  symbol: string
  type: 'network' | 'activity'
  flow?: 'Send' | 'Receive'
}>()
</script>

<template>
  <div class="relative text-3xl">
    <img v-if="logo" :src="logo" :alt="symbol" class="w-full aspect-square" />
    <FlexBox ai="center" jc="center" v-else class="rounded-full aspect-square text-white bg-blue-primary">
      {{ symbol[0].toLocaleUpperCase() }}
    </FlexBox>

    <template v-if="type === 'network'">
      <BTCNetworkLogo v-if="chain === 'btc'" class="absolute bottom-0 right-0" />
      <MVCNetworkLogo v-else-if="chain === 'mvc'" class="absolute bottom-0 right-0" />
    </template>
    <template v-else-if="type === 'activity'">
      <IncomeLogo v-if="flow === 'Send'" class="absolute bottom-0 right-0" />
      <ExpenseLogo v-else-if="flow === 'Receive'" class="absolute bottom-0 right-0" />
    </template>
  </div>
</template>

<style scoped lang="css"></style>
