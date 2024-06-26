<script lang="ts" setup>
import Decimal from 'decimal.js'
import { ref, computed, watch } from 'vue'
import { updateAsset } from '@/lib/balance'
import { UseImage } from '@vueuse/components'
import { isOfficialToken } from '@/lib/assets'
import { useBalanceQuery } from '@/queries/balance'
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'
import { type Asset, getTagInfo, type Tag } from '@/data/assets'
import { useExchangeRatesQuery, getExchangeCoinType } from '@/queries/exchange-rates'

const props = defineProps<{
  asset: Asset
  address: string
}>()

const asset = computed(() => props.asset)
const address = computed(() => props.address)

const tag = ref<Tag>()

if (props.asset?.contract) {
  tag.value = getTagInfo(props.asset.contract)
}

const balaceEnabled = computed(() => !!address && !!asset.value.symbol && !asset.value.balance)
const { data: balance } = useBalanceQuery(ref(address), ref(asset.value.symbol), { enabled: balaceEnabled })

const coinType = computed(() => {
  return getExchangeCoinType(asset.value.symbol, asset.value.contract)
})

const rateEnabled = computed(() => !!address && !!asset.value.symbol)
const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery(
  ref(asset.value.symbol),
  coinType,
  {
    enabled: rateEnabled,
  }
)

const assetPrice = computed(() => {
  if (asset.value?.balance) {
    return `${new Decimal(asset.value.balance.total).dividedBy(10 ** asset.value.decimal).toNumber()} ${asset.value.symbol}`
  } else if (balance.value) {
    return `${new Decimal(balance.value.total).dividedBy(10 ** asset.value.decimal).toNumber()} ${asset.value.symbol}`
  }
  return `-- ${asset.value.symbol}`
})

const assetUSD = computed(() => {
  if (isExchangeRateLoading.value) {
    return
  }
  const usdRate = new Decimal(exchangeRate.value?.price || 0)
  if (asset.value?.balance) {
    const balanceInStandardUnit = new Decimal(asset.value.balance?.total || 0).dividedBy(10 ** asset.value.decimal)
    return usdRate.mul(balanceInStandardUnit)
  } else if (balance.value && exchangeRate.value) {
    const balanceInStandardUnit = new Decimal(balance.value.total).dividedBy(10 ** asset.value.decimal)
    return usdRate.mul(balanceInStandardUnit)
  }
})

watch(
  assetUSD,
  (_assetUSD) => {
    if (_assetUSD) {
      updateAsset({ chain: asset.value.chain, name: asset.value.symbol, value: _assetUSD.toNumber() })
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
        <UseImage :src="asset.logo" v-if="asset.logo && asset.codeHash" class="h-10 w-10 rounded-md">
          <template #error>
            <div class="h-10 w-10 text-center leading-10 rounded-full text-white text-base bg-[#1E2BFF]">
              {{ asset.symbol[0].toLocaleUpperCase() }}
            </div>
          </template>
        </UseImage>
        <img class="h-10 w-10 rounded-full" :src="asset.logo" v-else-if="asset.logo" />
        <div v-else class="h-10 w-10 text-center leading-10 rounded-full text-white text-base bg-[#1E2BFF]">
          {{ asset.symbol[0].toLocaleUpperCase() }}
        </div>
        <div class="flex flex-col gap-y-1 items-start">
          <div :title="asset.tokenName" class="flex items-center gap-x-0.5 text-base">
            <span class="max-w-[100px] truncate overflow-hidden">{{ asset.tokenName }}</span>
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
          <div class="text-black-primary text-base">{{ assetPrice }}</div>
          <div :class="['text-sm font-normal text-gray-500']">
            <span v-if="assetUSD">{{ `$${assetUSD.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()} USD` }}</span>
            <span v-else>$-- USD</span>
          </div>
        </div>

        <div v-if="asset?.contract === 'BRC-20'" class="w-full mt-2.5 space-y-2">
          <div class="text-xs flex items-center justify-between w-full">
            <span class="text-[#909399]">Transferable:</span>
            <span class="text-black-primary truncate">{{ asset.balance?.transferBalance }}</span>
          </div>
          <div class="text-xs flex items-center justify-between w-full">
            <span class="text-[#909399]">Available:</span>
            <span class="text-black-primary truncate">{{ asset.balance?.availableBalanceSafe }}</span>
          </div>
          <div class="text-xs flex items-center justify-between w-full" v-if="asset.balance?.availableBalanceUnSafe">
            <span class="text-[#909399]">Available(pending):</span>
            <span class="text-black-primary truncate">{{ asset.balance?.availableBalanceUnSafe }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
