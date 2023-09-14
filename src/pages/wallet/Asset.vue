<script lang="ts" setup>
import { Ref, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { type Asset, allAssets, getTags } from '@/data/assets'
import { getBalance, useBalanceQuery } from '@/queries/balance'
import { getAddress } from '@/lib/account'
import { prettifyBalance } from '@/lib/formatters'
import Activities from './components/Activities.vue'
import { getExchangeRate, useExchangeRatesQuery } from '@/queries/exchange-rates'
import { ArrowUpRightIcon, QrCodeIcon } from '@heroicons/vue/20/solid'

const { symbol } = defineProps({
  symbol: {
    type: String,
    required: true,
  },
})
const asset = allAssets.find((asset) => asset.symbol === symbol) as Asset

const router = useRouter()

const tags = getTags(asset)
console.log('tags', tags)

const address: Ref<string> = ref('')
getAddress(asset.chain).then((add) => {
  address.value = add!
})

const enabled = computed(() => !!address.value && asset.queryable)
const rateEnabled = computed(() => !!address.value && asset.symbol === 'SPACE')

const { isLoading, data: balance } = useBalanceQuery(address, asset.symbol, { enabled })
const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery('MVC', { enabled: rateEnabled })

const exchange = computed(() => {
  if (balance.value && exchangeRate.value) {
    const usdRate: number = Number(exchangeRate.value.USD)
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

    <div class="mt-1.5 flex items-center gap-x-1.5">
      <div
        v-for="tag in tags"
        :key="tag.name"
        :style="`background-color:${tag.bg};color:${tag.color};`"
        :class="['px-1.5', 'py-0.5', 'rounded', 'text-xs']"
      >
        {{ tag.name }}
      </div>
    </div>

    <div class="mt-8 flex flex-col items-center self-stretch">
      <template v-if="asset?.queryable">
        <div v-if="isLoading">--</div>
        <template v-else-if="balance">
          <div class="mb-1 text-center text-3xl text-[#141416]">{{ prettifyBalance(balance) }} {{ asset.symbol }}</div>
          <div style="color: #909399">${{ exchange }}USD</div>
        </template>

        <!-- buttons -->
        <div class="mt-8 grid grid-cols-2 gap-x-3 self-stretch">
          <button class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3" @click="toSend">
            <ArrowUpRightIcon class="mr-1 h-4 w-4" />Send
          </button>
          <button class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3" @click="toReceive">
            <QrCodeIcon class="mr-1 h-4 w-4" />Receive
          </button>
        </div>

        <Activities class="mt-8 self-stretch" :asset="asset" :exchangeRate="Number(exchangeRate)" />
      </template>

      <div class="text-gray-500" v-else>No Service for {{ asset?.symbol }} yet.</div>
    </div>
  </div>
</template>
