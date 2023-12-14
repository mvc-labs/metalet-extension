<script lang="ts" setup>
import { computed, ref } from 'vue'
import { getTags } from '@/data/assets'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import { useBalanceQuery } from '@/queries/balance'
import Activities from './components/Activities.vue'
import { prettifyTokenBalance } from '@/lib/formatters'
import { useExchangeRatesQuery } from '@/queries/exchange-rates'
import { useBRCTickerAseetQuery, useBTCAssetQuery } from '@/queries/btc'
import { ArrowUpRightIcon, QrCodeIcon, ArrowsRightLeftIcon } from '@heroicons/vue/20/solid'

const route = useRoute()
const router = useRouter()

if (!route.params.address) {
  router.go(-1)
}
const address = ref<string>(route.params.address as string)

const symbol = ref<SymbolTicker>(route.params.symbol as SymbolTicker)
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

const { isLoading, data: balance } = useBalanceQuery(
  address,
  symbol,
  { enabled: computed(() => !!address.value && !!symbol.value) },
  { contract: asset.value?.contract, genesis: asset.value?.genesis }
)

const { isLoading: tickersLoading, data: tickersData } = useBRCTickerAseetQuery(address, symbol, {
  enabled: computed(() => !!address.value),
})

const tags = computed(() => {
  if (asset.value) {
    return getTags(asset.value)
  }
})

const rateEnabled = computed(() => !!symbol.value)

const { data: exchangeRate } = useExchangeRatesQuery(symbol, asset.value?.contract, { enabled: rateEnabled })

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
            <span v-if="asset.isNative">
              {{ prettifyTokenBalance(balance.total, asset.decimal, false, asset.symbol) }}
            </span>
            <span v-else-if="asset.contract === 'BRC-20'">
              {{ `${balance.total} ${asset.symbol}` }}
            </span>
            <span v-else>
              {{ prettifyTokenBalance(balance.total, asset.decimal, true) }}
            </span>
          </div>
          <div style="color: #909399">{{ exchange }}</div>
        </template>

        <!-- buttons -->
        <div class="mt-4 grid grid-cols-2 gap-x-3 self-stretch">
          <button
            v-if="asset.isNative"
            class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3"
            @click="toSend"
          >
            <ArrowUpRightIcon class="mr-1 h-4 w-4" />Send
          </button>
          <button
            v-if="asset.contract === 'BRC-20'"
            class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3"
            @click="toInscribe"
          >
            <ArrowsRightLeftIcon class="mr-1 h-4 w-4" />Transfer
          </button>
          <button class="secondary-btn col-span-1 flex items-center justify-center gap-x-1 py-3" @click="toReceive">
            <QrCodeIcon class="mr-1 h-4 w-4" />Receive
          </button>
        </div>

        <div v-if="asset.contract === 'BRC-20'" class="mt-8 w-full">
          <div class="flex items-end justify-between text-[#303133]">
            <span class="text-base">Transferable</span
            ><span class="text-lg"
              >{{ (tickersData && tickersData.tokenBalance.transferableBalance) || 0 }} {{ asset.symbol }}</span
            >
          </div>
          <div class="text-gray-500" v-if="tickersLoading">Loading BRC Tickers.</div>
          <div v-else class="grid grid-cols-3 gap-2 w-full mt-3" v-if="tickersData && tickersData.transferableList">
            <div
              :key="ticker.inscriptionId"
              v-for="ticker in tickersData.transferableList"
              class="flex flex-col items-center rounded-md bg-white w-[100px] h-[100px] border border-[#D8D8D8] relative"
            >
              <div class="mt-2.5 text-[#909399] text-sm">{{ ticker.ticker }}</div>
              <div class="mt-3 text-[#141416] text-lg font-bold">{{ ticker.amount }}</div>
              <div
                class="text-white text-xs bg-[#1E2BFF] rounded-b-md absolute bottom-0 w-full text-center pt-[5px] pb-[4px]"
              >
                #{{ ticker.inscriptionNumber }}
              </div>
            </div>
          </div>
          <div class="flex items-end justify-between text-[#303133] mt-3">
            <span class="text-base">Available</span
            ><span class="text-lg"
              >{{ (tickersData && tickersData.tokenBalance.availableBalance) || 0 }} {{ asset.symbol }}</span
            >
          </div>
        </div>

        <Activities class="mt-8 self-stretch" :asset="asset" :exchangeRate="Number(exchangeRate)" :address="address" />
      </template>

      <div class="text-gray-500" v-else>No Service for {{ asset?.symbol }} yet.</div>
    </div>
  </div>
</template>
