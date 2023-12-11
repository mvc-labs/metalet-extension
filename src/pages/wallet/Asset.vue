<script lang="ts" setup>
import { computed, ref } from 'vue'
import { getTags } from '@/data/assets'
import { useRoute, useRouter } from 'vue-router'
import { useBalanceQuery } from '@/queries/balance'
import { useBRCTickerAseetQuery, useBTCAssetQuery } from '@/queries/btc'
import { prettifyTokenBalance } from '@/lib/formatters'
import { useExchangeRatesQuery } from '@/queries/exchange-rates'
import { ArrowUpRightIcon, QrCodeIcon } from '@heroicons/vue/20/solid'
import Activities from './components/Activities.vue'
import { SymbolUC } from '@/lib/asset-symbol'

const route = useRoute()
const router = useRouter()

if (!route.params.address) {
  router.go(-1)
}
const address = ref<string>(route.params.address as string)

const symbol = ref<SymbolUC>(route.params.symbol as SymbolUC)
const { data: btcAssets } = useBTCAssetQuery(address, { enabled: computed(() => !!address.value) })
const asset = computed(() => {
  if (btcAssets.value && btcAssets.value.length > 0) {
    const asset = btcAssets.value.find((asset) => asset.symbol === symbol.value)
    if (!asset) {
      router.go(-1)
      return
    }
    return asset
  }
})

const {
  isLoading,
  data: balance,
  error,
} = useBalanceQuery(address, symbol, { enabled: computed(() => !!address.value && !!symbol.value) })

const { isLoading: tokenLoading, data: tokenData } = useBRCTickerAseetQuery(address, symbol, {
  enabled: computed(() => !!address.value),
})

const tags = computed(() => {
  if (asset.value) {
    return getTags(asset.value)
  }
})

const rateEnabled = computed(() => !!symbol.value)

const { data: exchangeRate } = useExchangeRatesQuery(symbol, { enabled: rateEnabled })

const exchange = computed(() => {
  if (balance.value && exchangeRate.value && asset.value) {
    const usdRate: number = Number(exchangeRate.value.price)
    const balanceInStandardUnit = balance.value.total / 10 ** asset.value.decimal
    const exchanged = balanceInStandardUnit * usdRate

    // 保留两位
    return `$${exchanged.toFixed(2)} USD`
  }

  return '$0.00 USD'
})

const toSend = () => {
  const { contract } = asset.value!
  if (contract === 'BRC-20') {
    router.push(`/wallet/sendBRC?symbol=${symbol.value}`)
    return
  }
  router.push(`/wallet/send?symbol=${symbol.value}&chain=${asset.value!.chain}`)
}

const toReceive = () => {
  router.push(`/wallet/receive?chain=${asset.value!.chain}`)
}

const toInscribe = () => {
  const { contract } = asset.value!
  if (contract === 'BRC-20') {
    router.push(`/wallet/inscribe?symbol=${symbol.value}`)
  }
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center" v-if="asset">
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
        <div class="mt-4 grid grid-cols-2 gap-x-3 self-stretch">
          <button class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3" @click="toSend">
            <ArrowUpRightIcon class="mr-1 h-4 w-4" />Send
          </button>
          <button class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3" @click="toReceive">
            <QrCodeIcon class="mr-1 h-4 w-4" />Receive
          </button>
        </div>
        <div class="mt-8 grid grid-cols-2 gap-x-3 self-stretch" v-if="asset.contract === 'BRC-20'">
          <button class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3" @click="toSend">
            <ArrowUpRightIcon class="mr-1 h-4 w-4" />Mint
          </button>
          <button class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3" @click="toInscribe">
            <QrCodeIcon class="mr-1 h-4 w-4" />Inscribe
          </button>
        </div>

        <div class="grid grid-cols-3 gap-2 mt-4" v-if="!tokenLoading && tokenData && tokenData.transferableList.length">
          <div
            class="flex flex-col items-center rounded-md bg-gray-100 p-2"
            v-for="token in tokenData.transferableList"
            :key="token.inscriptionId"
          >
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
