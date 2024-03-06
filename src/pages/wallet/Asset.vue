<script lang="ts" setup>
import Decimal from 'decimal.js'
import { computed, ref, watch } from 'vue'
import { updateAsset } from '@/lib/balance'
import Ticker from './components/Ticker.vue'
import Loading from '@/components/Loading.vue'
import { calcBalance } from '@/lib/formatters'
import MintPNG from '@/assets/icons-v3/mint.png'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import AssetLogo from '@/components/AssetLogo.vue'
import { useBalanceQuery } from '@/queries/balance'
import EmptyIcon from '@/assets/icons-v3/empty.svg'
import Activities from './components/Activities.vue'
import FilterIcon from '@/assets/icons-v3/filter.svg'
import SendPNG from '@/assets/icons-v3/send_detail.png'
import TransferPNG from '@/assets/icons-v3/transfer.png'
import SelectorIcon from '@/assets/icons-v3/selector.svg'
import { getTags, BTCAsset, MVCAsset } from '@/data/assets'
import ArrowDwonIcon from '@/assets/icons-v3/arrow_down.svg'
import ReceivePNG from '@/assets/icons-v3/receive_detail.png'
import { useBRCTickerAseetQuery, useBRC20AssetQuery } from '@/queries/btc'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useExchangeRatesQuery, getExchangeCoinType } from '@/queries/exchange-rates'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const route = useRoute()
const router = useRouter()
const isShowAllTransferable = ref(false)

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

const transferableList = computed(() => {
  if (tickersData.value) {
    if (isShowAllTransferable.value) {
      return tickersData.value?.transferableList
    } else {
      return tickersData.value?.transferableList.slice(0, 3)
    }
  }
})

const availableBalanceSafe = computed(() => {
  if (tickersData.value?.tokenBalance) {
    return Number(tickersData.value?.tokenBalance.availableBalance)
  }
  return '--'
})

const availableBalanceUnSafe = computed(() => {
  if (tickersData.value?.tokenBalance) {
    return Math.abs(Number(tickersData.value?.tokenBalance.availableBalanceUnSafe))
  }
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
  <div class="flex flex-col items-center space-y-6 w-full" v-if="asset">
    <div class="flex flex-col items-center">
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
    </div>

    <div class="flex items-center justify-center gap-x-2">
      <template v-if="asset.contract === 'BRC-20'">
        <a href="javascript:void(0);" class="blue-light-btn">
          <img :src="MintPNG" alt="Mint" />
          <span>Mint</span>
        </a>
        <button @click="toTransfer" class="blue-primary-btn">
          <img :src="TransferPNG" alt="Transfer" />
          <span>Transfer</span>
        </button>
      </template>
      <template v-else>
        <button @click="toSend" v-if="asset.isNative" class="blue-light-btn">
          <img :src="SendPNG" alt="Send" />
          <span>Send</span>
        </button>
        <button @click="toReceive" class="blue-primary-btn">
          <img :src="ReceivePNG" alt="Receive" />
          <span>Receive</span>
        </button>
      </template>
    </div>

    <div v-if="asset.contract === 'BRC-20'" class="border border-gray-soft rounded-lg w-full">
      <Tabs default-value="Transferable">
        <TabsList class="grid grid-cols-2">
          <TabsTrigger value="Transferable">
            <span class="text-lg">{{ tickersData?.tokenBalance.transferableBalance || '--' }}</span>
            <span class="text-sm text-gray-primary">Transferable</span>
          </TabsTrigger>
          <TabsTrigger value="Available">
            <div class="text-lg">
              <span>{{ availableBalanceSafe }}</span>
              <span v-if="availableBalanceUnSafe" class="text-gray-primary"> + {{ availableBalanceUnSafe }} </span>
            </div>
            <span class="text-sm text-gray-primary">Available</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Transferable">
          <Loading text="Transferable Token Loading..." v-if="tickersLoading" />
          <template v-else-if="transferableList?.length">
            <div class="grid grid-cols-3 gap-x-2 gap-y-4">
              <Ticker
                :ticker="ticker.ticker"
                :amount="ticker.amount"
                :key="ticker.inscriptionId"
                v-for="ticker in transferableList"
                :inscriptionNumber="ticker.inscriptionNumber"
              />
            </div>
            <div
              v-if="!isShowAllTransferable"
              @click="isShowAllTransferable = true"
              class="mt-4 pt-3 border-t-2 border-gray-soft text-xs cursor-pointer flex items-center justify-center text-gray-primary gap-x-0.5"
            >
              <span>All</span>
              <ArrowDwonIcon />
            </div>
          </template>
          <div v-else class="pt-6 pb-8">
            <EmptyIcon class="mx-auto" />
          </div>
        </TabsContent>
        <TabsContent value="Available">
          <div v-if="availableBalanceUnSafe" class="grid grid-cols-3 gap-x-2 gap-y-4">
            <Ticker :ticker="asset.symbol" :amount="availableBalanceUnSafe" />
          </div>
          <div v-else class="pt-6 pb-8">
            <EmptyIcon class="mx-auto" />
          </div>
        </TabsContent>
      </Tabs>
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

<style scoped lang="css">
.btn {
  @apply w-[119px] h-12 rounded-3xl flex items-center justify-center gap-x-2;
}

.blue-light-btn {
  @apply btn bg-blue-light text-blue-primary;
}

.blue-primary-btn {
  @apply btn bg-blue-primary text-white;
}

div[role='tablist'] {
  @apply p-0 h-auto;
}

button[role='tab'] {
  @apply flex flex-col items-center px-0 py-4 rounded-none border-b-2 border-transparent;
}

button[role='tab'][aria-selected='true'] {
  @apply border-blue-primary;
}

div[role='tabpanel'] {
  @apply px-3 py-4 mt-0;
}
</style>
