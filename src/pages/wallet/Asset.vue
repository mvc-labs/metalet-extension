<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { allAssets } from '@/data/assets'
import { useBalanceQuery } from '@/queries/balance'
import { address } from '@/lib/account'
import { prettifyBalance } from '@/lib/formatters'
import Activities from './components/Activities.vue'
import { useExchangeRatesQuery } from '@/queries/exchange-rates'

const route = useRoute()
const router = useRouter()

const symbol = route.params.symbol as string
const asset = computed(() => allAssets.find((asset) => asset.symbol === symbol))

const enabled = computed(() => !!address.value && asset.value!.queryable)
const { isLoading, data: balance } = useBalanceQuery(address, symbol, { enabled })

const rateEnabled = computed(() => !!address.value && asset.value?.symbol === 'SPACE')
const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery('MVC', { enabled: rateEnabled })

const exchange = computed(() => {
  if (balance.value && exchangeRate.value) {
    const usdRate: number = Number(exchangeRate.value.USD)
    const balanceInStandardUnit = balance.value / 10 ** asset.value!.decimal
    const exchanged = balanceInStandardUnit * usdRate

    // 保留两位
    return `$${exchanged.toFixed(2)}`
  }

  return '--'
})

const toSend = () => {
  router.push(`/wallet/send?symbol=${symbol}`)
}
const toReceive = () => {
  router.push(`/wallet/receive?chain=${asset.value!.chain}`)
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center">
    <img :src="asset!.logo" alt="" class="h-20 w-20 rounded-xl" />

    <div class="mt-8 flex flex-col items-center self-stretch">
      <template v-if="asset?.queryable">
        <div class="" v-if="isLoading">--</div>
        <div class="mb-1 text-center text-xl" v-else-if="balance">
          {{ prettifyBalance(balance) }}
        </div>
        <div class="text-sm text-gray-500" v-if="isExchangeRateLoading">--</div>
        <div class="text-sm text-gray-500" v-else>{{ exchange }}</div>

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
