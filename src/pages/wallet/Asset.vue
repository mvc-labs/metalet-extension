<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createEmit } from '@/lib/emitters'
import { useBalanceQuery } from '@/queries/balance'
import { allAssets, getTags } from '@/data/assets'
import { useBRCTickerAseetQuery } from '@/queries/btc'
import { prettifyTokenBalance } from '@/lib/formatters'
import { useExchangeRatesQuery } from '@/queries/exchange-rates'
import { ArrowUpRightIcon, QrCodeIcon } from '@heroicons/vue/20/solid'

import Activities from './components/Activities.vue'

const { symbol } = defineProps({
  symbol: {
    type: String,
    required: true,
  },
})

const asset = allAssets.find((asset) => asset.symbol === symbol)!

const router = useRouter()

const tags = getTags(asset)

const address = ref<string>('')
createEmit<string>('getAddress')(asset.chain).then((add) => {
  address.value = add!
})

const { isLoading: tokenLoading, data: tokenData } = useBRCTickerAseetQuery(address, symbol, { enabled: computed(() => !!address.value && !asset.isNative) })

const enabled = computed(() => !!address.value && asset.queryable)
const rateEnabled = computed(() => !!address.value && asset.isNative)

const { isLoading, data: balance } = useBalanceQuery(address, asset.symbol, { enabled })
const { data: exchangeRate } = useExchangeRatesQuery(asset.symbol, { enabled: rateEnabled })

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
  const { chain, symbol, isNative } = asset
  if (chain === 'btc' && !isNative) {
    router.push(`/wallet/sendBRC?symbol=${symbol}`)
    return
  }
  router.push(`/wallet/send?symbol=${symbol}&chain=${asset.chain}`)
}
const toReceive = () => {
  router.push(`/wallet/receive?chain=${asset.chain}`)
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center">
    <img :src="asset!.logo" alt="" class="h-20 w-20 rounded-xl" />

    <div class="mt-1.5 flex items-center gap-x-1.5">
      <div v-for="tag in tags" :key="tag.name" :style="`background-color:${tag.bg};color:${tag.color};`"
        :class="['px-1.5', 'py-0.5', 'rounded', 'text-xs']">
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
          <button class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3" @click="toSend">
            <ArrowUpRightIcon class="mr-1 h-4 w-4" />Send
          </button>
          <button class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3" @click="toReceive">
            <QrCodeIcon class="mr-1 h-4 w-4" />Receive
          </button>
        </div>

        <div class="grid grid-cols-3 gap-2 mt-4" v-if="!tokenLoading && tokenData && tokenData.transferableList.length
          ">
          <div class="flex flex-col items-center rounded-md bg-gray-100 p-2" v-for="token in tokenData.transferableList"
            :key="token.inscriptionId">
            <div>{{ token.ticker }}</div>
            <div>{{ token.amount }}</div>
            <div>#{{ token.inscriptionNumber }}</div>
          </div>
        </div>

        <Activities class="mt-8 self-stretch" :asset="asset" :exchangeRate="Number(exchangeRate)" />
      </template>

      <div class="text-gray-500" v-else>No Service for {{ asset?.symbol }} yet.</div>
    </div>
  </div>
</template>
