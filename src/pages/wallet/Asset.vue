<script lang="ts" setup>
import Decimal from 'decimal.js'
import { computed, ref, watch } from 'vue'
import { updateAsset } from '@/lib/balance'
import Loading from '@/components/Loading.vue'
import { calcBalance } from '@/lib/formatters'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import AssetLogo from '@/components/AssetLogo.vue'
import { useBalanceQuery } from '@/queries/balance'
import Activities from './components/Activities.vue'
import FilterIcon from '@/assets/icons-v3/filter.svg'
import SendPNG from '@/assets/icons-v3/send_detail.png'
import SelectorIcon from '@/assets/icons-v3/selector.svg'
import { getTags, BTCAsset, MVCAsset } from '@/data/assets'
import ReceivePNG from '@/assets/icons-v3/receive_detail.png'
import { ArrowsRightLeftIcon } from '@heroicons/vue/20/solid'
import { useBRCTickerAseetQuery, useBRC20AssetQuery } from '@/queries/btc'
import { useExchangeRatesQuery, getExchangeCoinType } from '@/queries/exchange-rates'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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
  <div class="flex flex-col items-center" v-if="asset">
    <AssetLogo :logo="asset.logo" :chain="asset.chain" :symbol="asset.symbol" type="network" />

    <div class="mt-3 text-2xl">
      <span v-if="asset.balance"> {{ calcBalance(asset.balance.total, asset.decimal, asset.symbol) }}</span>
      <span v-else-if="balance">{{ calcBalance(balance.total, asset.decimal, asset.symbol) }}</span>
      <span v-else>-- {{ asset.symbol }}</span>
    </div>

    <div class="mt-0.5 text-sm text-gray-primary">$ {{ assetUSD?.toNumber() }} USD</div>

    <div class="space-x-1">
      <div v-for="tag in tags" :key="tag.name" :class="['text-gray-primary', 'text-xs']">
        {{ tag.name }}
      </div>
    </div>

    <div class="mt-6 flex items-center justify-center gap-x-2 w-full text-blue-primary">
      <button
        @click="toSend"
        v-if="asset.isNative"
        class="w-[119px] h-12 bg-blue-light rounded-3xl flex items-center justify-center gap-x-2"
      >
        <img :src="SendPNG" alt="Send" />
        <span>Send</span>
      </button>
      <button
        @click="toTransfer"
        v-if="asset.contract === 'BRC-20'"
        class="w-[119px] h-12 bg-blue-light rounded-3xl flex items-center justify-center gap-x-2"
      >
        <ArrowsRightLeftIcon class="mr-1 h-4 w-4" />
        <span>Transfer</span>
      </button>
      <button
        @click="toReceive"
        class="w-[119px] h-12 bg-blue-primary text-white rounded-3xl flex items-center justify-center gap-x-2"
      >
        <img :src="ReceivePNG" alt="Receive" />
        <span>Receive</span>
      </button>
    </div>

    <div class="mt-6 w-full">
      <div v-if="asset.contract === 'BRC-20'" class="mt-8 w-full">
        <div class="flex items-end justify-between">
          <span class="text-base">Transferable</span
          ><span class="text-lg"
            >{{ (tickersData && tickersData.tokenBalance.transferableBalance) || 0 }} {{ asset.symbol }}</span
          >
        </div>
        <Loading text="Loading BRC Tickers..." v-if="tickersLoading" />
        <div class="grid grid-cols-3 gap-2 w-full mt-3" v-else-if="tickersData && tickersData.transferableList.length">
          <div
            :key="ticker.inscriptionId"
            v-for="ticker in tickersData.transferableList"
            class="flex flex-col items-center rounded-md bg-white w-[100px] h-[100px] border border-[#D8D8D8] relative"
          >
            <div class="mt-2.5 text-gray-primary text-sm">{{ ticker.ticker }}</div>
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
        <div class="my-3">
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
    </div>

    <div class="w-full">
      <div class="-mx-4 h-11 bg-gray-light px-4 py-[13px] text-ss" v-if="false">
        <DropdownMenu>
          <DropdownMenuTrigger class="flex items-center justify-between w-full">
            <div class="flex items-center gap-x-2">
              <span>Time</span>
              <SelectorIcon />
            </div>
            <FilterIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="bg-white">
            <DropdownMenuItem @select="null">Time</DropdownMenuItem>
            <DropdownMenuItem @select="null">Other</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Activities class="mt-8 self-stretch" :asset="asset" :exchangeRate="Number(exchangeRate)" :address="address" />
    </div>
  </div>
  <Loading v-else text="Asset Loading..." />
</template>
