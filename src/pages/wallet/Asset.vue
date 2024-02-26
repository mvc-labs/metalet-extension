<script lang="ts" setup>
import Decimal from 'decimal.js'
import { computed, ref, watch } from 'vue'
import { updateAsset } from '@/lib/balance'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import { useBalanceQuery } from '@/queries/balance'
import Activities from './components/Activities.vue'
import { prettifyTokenBalance } from '@/lib/formatters'
import { getTags, BTCAsset, MVCAsset } from '@/data/assets'
import { useBRCTickerAseetQuery, useBRC20AssetQuery } from '@/queries/btc'
import { useExchangeRatesQuery, getExchangeCoinType } from '@/queries/exchange-rates'
import { ArrowUpRightIcon, QrCodeIcon, ArrowsRightLeftIcon } from '@heroicons/vue/20/solid'

const route = useRoute()
const router = useRouter()

if (!route.params.address) {
  router.go(-1)
}
const address = ref<string>(route.params.address as string)
const symbol = ref<SymbolTicker>(route.params.symbol as SymbolTicker)
const { data: btcAssets } = useBRC20AssetQuery(address, { enabled: computed(() => !!address.value) })

const asset = computed(() => {
  if (symbol.value === 'BTC') {
    return BTCAsset
  }
  if (symbol.value === 'SPACE') {
    return MVCAsset
  }
  if (btcAssets.value) {
    const asset = btcAssets.value.find((asset) => asset.symbol === symbol.value)
    if (!asset) {
      router.go(-1)
      return
    }
    return asset
  }
})

const coinType = computed(() => {
  if (asset.value) {
    return getExchangeCoinType(asset.value.symbol, asset.value.contract)
  }
})

const balaceEnabled = computed(() => {
  if (asset.value) {
    return !!address.value && !!symbol.value && !asset.value.balance
  }
  return false
})

const { isLoading, data: balance } = useBalanceQuery(address, symbol, {
  enabled: balaceEnabled,
})

const tickerEnabled = computed(() => {
  if (asset.value) {
    return !!address.value && !!symbol.value && asset.value.contract === 'BRC-20'
  }
  return false
})

const { isLoading: tickersLoading, data: tickersData } = useBRCTickerAseetQuery(address, symbol, {
  enabled: tickerEnabled,
})

const tags = computed(() => {
  if (asset.value) {
    return getTags(asset.value)
  }
})

const rateEnabled = computed(() => {
  if (asset.value) {
    return !!address.value && !!symbol.value
  }
  return false
})

const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery(symbol, coinType, {
  enabled: rateEnabled,
})

const assetUSD = computed(() => {
  if (isExchangeRateLoading.value) {
    return
  }
  const usdRate = new Decimal(exchangeRate.value?.price || 0)
  if (asset.value) {
    if (asset.value?.balance) {
      const balanceInStandardUnit = new Decimal(asset.value.balance?.total || 0).dividedBy(10 ** asset.value.decimal)
      return usdRate.mul(balanceInStandardUnit)
    } else if (balance.value && exchangeRate.value) {
      const balanceInStandardUnit = new Decimal(balance.value.total).dividedBy(10 ** asset.value.decimal)
      return usdRate.mul(balanceInStandardUnit)
    }
  }
})

watch(assetUSD, (_assetUSD) => {
  if (asset.value && _assetUSD) {
    updateAsset({ chain: asset.value.chain, name: asset.value.symbol, value: _assetUSD.toNumber() })
  }
})

const toSend = () => {
  const { contract } = asset.value!
  if (contract === 'BRC-20') {
    router.push(`/wallet/sendBRC?symbol=${symbol.value}`)
    return
  }
  router.push({
    name: 'send',
    params: {
      symbol: symbol.value,
      address: address.value,
    },
  })
}

const toReceive = () => {
  router.push(`/wallet/receive?chain=${asset.value!.chain}`)
}

const toTransfer = () => {
  const { contract } = asset.value!
  if (contract === 'BRC-20') {
    router.push({ name: 'transfer', params: { address: address.value, symbol: symbol.value } })
  }
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center" v-if="asset">
    <img v-if="asset!.logo" :src="asset.logo" alt="" class="h-20 w-20 rounded-full" />
    <div v-else class="h-20 w-20 text-center rounded-full text-white text-3xl bg-[#1E2BFF]" style="line-height: 80px">
      {{ symbol[0].toLocaleUpperCase() }}
    </div>

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
        <template v-if="asset.balance">
          <div class="mb-1 text-center text-3xl text-black-primary font-bold" v-if="asset.contract === 'BRC-20'">
            {{ prettifyTokenBalance(asset.balance.total, asset.decimal, false, asset.symbol) }}
          </div>
          <div class="mb-1 text-center text-3xl text-black-primary" v-else>
            {{ asset.balance.total }} {{ asset.symbol }}
          </div>

          <div class="text-[#909399] text-center">
            <span v-if="assetUSD">{{ `$${assetUSD.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()} USD` }}</span>
            <span v-else>$-- USD</span>
          </div>
        </template>
        <div v-else-if="isLoading">--</div>
        <template v-else-if="balance">
          <div class="mb-1 text-center text-3xl text-black-primary">
            <span v-if="asset.isNative">
              {{ prettifyTokenBalance(balance.total, asset.decimal, false, asset.symbol) }}
            </span>
            <span v-else>
              {{ prettifyTokenBalance(balance.total, asset.decimal, true) }}
            </span>
          </div>
          <div class="text-[#909399] text-center">
            <span v-if="assetUSD">{{ `$${assetUSD.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()} USD` }}</span>
            <span v-else>$-- USD</span>
          </div>
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
            @click="toTransfer"
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
          <div class="w-full py-3 text-center text-sm font-bold text-gray-500" v-if="tickersLoading">
            Loading BRC Tickers...
          </div>
          <div
            class="grid grid-cols-3 gap-2 w-full mt-3"
            v-else-if="tickersData && tickersData.transferableList.length"
          >
            <div
              :key="ticker.inscriptionId"
              v-for="ticker in tickersData.transferableList"
              class="flex flex-col items-center rounded-md bg-white w-[100px] h-[100px] border border-[#D8D8D8] relative"
            >
              <div class="mt-2.5 text-[#909399] text-sm">{{ ticker.ticker }}</div>
              <div class="mt-3 text-black-primary text-lg font-bold truncate">{{ ticker.amount }}</div>
              <div
                class="text-white text-xs bg-[#1E2BFF] rounded-b-md absolute bottom-0 w-full text-center pt-[5px] pb-[4px]"
              >
                <span v-if="ticker.inscriptionNumber === -1">Uncomfirmed</span>
                <span v-else>#{{ ticker.inscriptionNumber }}</span>
              </div>
            </div>
          </div>
          <div v-else class="w-full h-[142px] flex items-center justify-center text-[#999999]">Empty</div>
          <div class="text-[#303133] mt-3">
            <div class="flex items-center justify-between">
              <span class="text-base">Available</span>
              <span class="text-lg" v-if="tickersData">
                <span>{{ tickersData.tokenBalance.availableBalanceSafe }} {{ asset.symbol }}</span>
                <span v-if="Number(tickersData.tokenBalance.availableBalanceUnSafe)" class="text-gray-primary">
                  + {{ Math.abs(Number(tickersData.tokenBalance.availableBalanceUnSafe)) }} {{ asset.symbol }}</span
                >
              </span>
              <span class="text-lg" v-else>--</span>
            </div>
            <div
              v-if="tickersData && Number(tickersData.tokenBalance.availableBalanceUnSafe)"
              class="text-right text-sm text-gray-primary"
            >
              (Wait to be confirmed)
            </div>
          </div>
        </div>

        <Activities class="mt-8 self-stretch" :asset="asset" :exchangeRate="Number(exchangeRate)" :address="address" />
      </template>

      <div class="text-gray-500" v-else>No Service for {{ symbol }} yet.</div>
    </div>
  </div>
  <div v-else class="w-full py-3 text-center text-sm font-bold text-gray-500">Asset Loading...</div>
</template>
