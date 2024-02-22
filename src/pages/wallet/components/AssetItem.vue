<script lang="ts" setup>
import Decimal from 'decimal.js'
import { ref, computed, watch } from 'vue'
import { updateAsset } from '@/lib/balance'
import { isOfficialToken } from '@/lib/assets'
import { useBalanceQuery } from '@/queries/balance'
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'
import { useExchangeRatesQuery } from '@/queries/exchange-rates'
import { type Asset, getTagInfo, type Tag } from '@/data/assets'

const { asset, address } = defineProps<{
  asset: Asset
  address: string
}>()

// console.log('asset', asset.symbol, asset)

const tag = ref<Tag>()

if (asset?.contract) {
  tag.value = getTagInfo(asset.contract)
}

const balaceEnabled = computed(() => !!address && !!asset.symbol && !asset.balance)
const { data: balance } = useBalanceQuery(ref(address), ref(asset.symbol), { enabled: balaceEnabled })

const rateEnabled = computed(() => !!address && !!asset.symbol)
const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery(
  ref(asset.symbol),
  asset?.contract,
  {
    enabled: rateEnabled,
  }
)

const assetPrice = computed(() => {
  if (asset?.balance) {
    return `${new Decimal(asset.balance.total).dividedBy(10 ** asset.decimal).toNumber()} ${asset.symbol}`
  } else if (balance.value) {
    return `${new Decimal(balance.value.total).dividedBy(10 ** asset.decimal).toNumber()} ${asset.symbol}`
  }
  return `-- ${asset.symbol}`
})

const assetUSD = computed(() => {
  if (isExchangeRateLoading.value) {
    return
  }
  const usdRate = new Decimal(exchangeRate.value?.price || 0)
  if (asset?.balance) {
    const balanceInStandardUnit = new Decimal(asset.balance?.total || 0).dividedBy(10 ** asset.decimal)
    return usdRate.mul(balanceInStandardUnit)
  } else if (balance.value && exchangeRate.value) {
    const balanceInStandardUnit = new Decimal(balance.value.total).dividedBy(10 ** asset.decimal)
    return usdRate.mul(balanceInStandardUnit)
  }
})

watch(
  assetUSD,
  (_assetUSD) => {
    if (_assetUSD) {
      updateAsset({ chain: asset.chain, name: asset.symbol, value: _assetUSD.toNumber() })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="group relative transition hover:z-10">
    <div class="flex gap-2 cursor-pointer items-center justify-between rounded-md bg-gray-100 px-4 py-4">
      <!-- left part -->
      <div class="flex flex-shrink-0 items-center gap-x-3">
        <img class="h-10 w-10 rounded-full" :src="asset.logo" v-if="asset.logo" />
        <div v-else class="h-10 w-10 text-center leading-10 rounded-full text-white text-base bg-[#1E2BFF]">
          {{ asset.symbol[0].toLocaleUpperCase() }}
        </div>
        <div class="flex flex-col gap-y-1 items-start">
          <div :title="asset.tokenName" class="flex items-center gap-x-0.5 text-base">
            <span class="font-bold max-w-[100px] truncate overflow-hidden">{{ asset.tokenName }}</span>
            <CheckBadgeIcon
              class="h-4 w-4 shrink-0 text-blue-500"
              v-if="asset?.genesis && isOfficialToken(asset.genesis)"
            />
          </div>

          <div
            v-if="tag"
            :style="`background-color:${tag.bg};color:${tag.color};`"
            :class="['px-1.5', 'py-0.5', 'rounded', 'text-xs', 'inline-block', 'scale-75', 'origin-left']"
          >
            {{ tag.name }}
          </div>
        </div>
      </div>

      <div class="flex grow overflow-hidden flex-col items-end text-xs gap-y-1">
        <div
          :class="[
            'w-full text-right',
            asset?.contract === 'BRC-20' ? 'border-b border-[#D8D8D8] border-dashed pb-3' : '',
          ]"
        >
          <div class="text-black-primary font-bold text-base">{{ assetPrice }}</div>
          <div :class="['text-sm font-normal text-gray-500']">
            <span v-if="assetUSD">{{ `$${assetUSD.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()} USD` }}</span>
            <span v-else>$-- USD</span>
          </div>
        </div>

        <div v-if="asset?.contract === 'BRC-20'" class="w-full mt-2.5 space-y-2">
          <div class="text-xs flex items-center justify-between w-full">
            <span class="text-[#909399]">Transferable:</span>
            <span class="text-black-primary font-bold truncate">{{ asset.balance?.transferBalance || 0 }}</span>
          </div>
          <div class="text-xs flex items-center justify-between w-full">
            <span class="text-[#909399]">Available:</span>
            <span class="text-black-primary font-bold truncate">{{ asset.balance?.availableBalance || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
