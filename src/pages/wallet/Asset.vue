<script lang="ts" setup>
import { Ref, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowUpRightIcon, QrCodeIcon } from '@heroicons/vue/20/solid'

import { type Asset, allAssets, getTags } from '@/data/assets'
import { useBalanceQuery } from '@/queries/balance'
import { getAddress } from '@/lib/account'

import { prettifyBalance, prettifyTokenBalance } from '@/lib/formatters'
import { useExchangeRatesQuery } from '@/queries/exchange-rates'

import Activities from './components/Activities.vue'

const { symbol } = defineProps({
  symbol: {
    type: String,
    required: true,
  },
})

const asset = allAssets.find((asset) => asset.symbol === symbol) as Asset

const router = useRouter()

const tags = getTags(asset)

const address: Ref<string> = ref('')
getAddress(asset.chain).then((add) => {
  address.value = add!
})

const enabled = computed(() => !!address.value && asset.queryable)
const rateEnabled = computed(() => !!address.value && asset.isNative)

const { isLoading, data: balance } = useBalanceQuery(address, asset.symbol, { enabled })
const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery(asset.symbol, {
  enabled: rateEnabled,
})

const exchange = computed(() => {
  if (balance.value && exchangeRate.value) {
    const usdRate: number = Number(exchangeRate.value.price)
    const balanceInStandardUnit = balance.value.total / 10 ** asset.decimal
    const exchanged = balanceInStandardUnit * usdRate

    // 保留两位
    return `$${exchanged.toFixed(2)} USD`
  }

  return '$0.00 USD'
})

const toSend = () => {
  router.push(`/wallet/send?symbol=${symbol}`)
}
const toReceive = () => {
  router.push(`/wallet/receive?chain=${asset.chain}`)
}

const isBtcRelated = computed(() => asset.chain === 'btc')
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
          <div class="mb-1 text-center text-3xl text-[#141416]">
            {{ prettifyTokenBalance(balance.total, asset.decimal, false, symbol) }}
          </div>
          <div style="color: #909399">{{ exchange }}</div>
        </template>

        <!-- buttons -->
        <div class="mt-8 grid grid-cols-2 gap-x-3 self-stretch">
          <button
            class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3"
            :class="isBtcRelated && 'hidden'"
            @click="toSend"
            :disabled="isBtcRelated"
          >
            <ArrowUpRightIcon class="mr-1 h-4 w-4" />Send
          </button>
          <button
            class="secondary-btn flex items-center justify-center gap-x-1 py-3"
            :class="isBtcRelated ? 'col-span-2' : 'col-span-1'"
            @click="toReceive"
          >
            <QrCodeIcon class="mr-1 h-4 w-4" />Receive
          </button>
        </div>

        <Activities class="mt-8 self-stretch" :asset="asset" :exchangeRate="Number(exchangeRate)" />
      </template>

      <div class="text-gray-500" v-else>No Service for {{ asset?.symbol }} yet.</div>
    </div>
  </div>
</template>
