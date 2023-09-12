<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { type Asset, allAssets, getTags } from '@/data/assets'
import { getBalance } from '@/queries/balance'
import { getAddress } from '@/lib/account'
import { prettifyBalance } from '@/lib/formatters'
import Activities from './components/Activities.vue'
import { getExchangeRate } from '@/queries/exchange-rates'

const route = useRoute()
const router = useRouter()

const symbol = route.params.symbol as string

const asset = allAssets.find(asset => asset.symbol === symbol) as Asset
const tags = getTags(asset)
console.log("tags", tags)

const balance = ref(0)
const exchangeRate = ref('0')
const isExchangeRateLoading = ref(false)


getAddress(asset.chain).then(async (address) => {
  balance.value = await getBalance(address, asset.chain)
  console.log("balance", asset.symbol, balance.value);

  exchangeRate.value = await getExchangeRate(asset.symbol)
  console.log("exchangeRate", asset.symbol, exchangeRate.value);
})

const exchange = computed(() => {
  if (balance.value && exchangeRate.value) {
    const usdRate: number = Number(exchangeRate.value)
    const balanceInStandardUnit = balance.value / 10 ** asset.decimal
    const exchanged = balanceInStandardUnit * usdRate

    // 保留两位
    return `$${exchanged.toFixed(2)}`
  }

  return '0'
})

const toSend = () => {
  router.push(`/wallet/send?symbol=${symbol}`)
}
const toReceive = () => {
  router.push(`/wallet/receive?chain=${asset.chain}`)
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center">
    <img :src="asset!.logo" alt="" class="h-20 w-20 rounded-xl" />

    <div class="flex items-center gap-x-1.5 mt-1.5">
      <div v-for="tag in tags" :key="tag.name" :style="`background-color:${tag.bg};color:${tag.color};`"
        :class="['px-1.5', 'py-0.5', 'rounded', 'text-xs']">{{
          tag.name }}</div>
    </div>

    <div class="mt-8 flex flex-col items-center self-stretch">
      <template v-if="asset?.queryable">
        <div class="mb-1 text-center text-3xl text-[#141416]">
          {{ prettifyBalance(balance) }} {{ asset.symbol }}
        </div>
        <div style="color:#909399">${{ exchange }}USD</div>

        <!-- buttons -->
        <div class="mt-8 grid grid-cols-2 gap-x-3 self-stretch">
          <button class="secondary-btn col-span-1 py-3" @click="toSend">Send</button>
          <button class="secondary-btn col-span-1 py-3" @click="toReceive">Receive</button>
        </div>

        <Activities class="mt-8 self-stretch" :asset="asset" />
      </template>

      <div class="text-gray-500" v-else>No Service for {{ asset?.symbol }} yet.</div>
    </div>
  </div>
</template>
