<script lang="ts" setup>
import Decimal from 'decimal.js'
import { ref, computed } from 'vue'
import { updateAsset } from '@/lib/balance'
import { isOfficialToken } from '@/lib/assets'
import { useBalanceQuery } from '@/queries/balance'
import { prettifyTokenBalance } from '@/lib/formatters'
import { useExchangeRatesQuery } from '@/queries/exchange-rates'
import { type Asset, getTagInfo, type Tag } from '@/data/assets'
import { CircleStackIcon, CheckBadgeIcon } from '@heroicons/vue/24/solid'

const { asset, address } = defineProps<{
  asset: Asset
  address: string
}>()

const tag = ref<Tag>()

if (asset?.contract) {
  tag.value = getTagInfo(asset.contract)
}

const balaceEnabled = computed(() => !!address && !!asset.symbol && !asset.balance)
const {
  isLoading,
  data: balance,
  error: balanceError,
} = useBalanceQuery(ref(address), ref(asset.symbol), { enabled: balaceEnabled })

const rateEnabled = computed(
  () => !!address && !!asset.symbol && !(asset?.contract && ['BRC-20'].includes(asset.contract))
)
const {
  isLoading: isExchangeRateLoading,
  data: exchangeRate,
  error: exchangeError,
} = useExchangeRatesQuery(ref(asset.symbol), asset?.contract, {
  enabled: rateEnabled,
})

const exchange = computed(() => {
  if (asset?.balance) {
    const usdRate = new Decimal(exchangeRate.value?.price || 0)
    const balanceInStandardUnit = new Decimal(asset.balance?.total || 0)
    const exchanged = usdRate.mul(balanceInStandardUnit)
    updateAsset({ name: asset.symbol, value: exchanged.toNumber() })
    return `$${exchanged.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)} USD`
  } else if (balance.value && exchangeRate.value) {
    const usdRate = new Decimal(exchangeRate.value?.price || 0)
    const balanceInStandardUnit = new Decimal(balance.value.total).dividedBy(1e8)
    const exchanged = usdRate.mul(balanceInStandardUnit)
    updateAsset({ name: asset.symbol, value: exchanged.toNumber() })
    return `$${exchanged.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)} USD`
  }

  return '$-- USD'
})
</script>

<template>
  <div class="group relative transition hover:z-10">
    <div class="flex cursor-pointer items-center justify-between rounded-md bg-gray-100 px-4 py-4">
      <div class="flex items-center gap-x-3">
        <img class="h-10 w-10 rounded-full" :src="asset.logo" v-if="asset.logo" />
        <CircleStackIcon class="h-10 w-10 text-gray-300 transition-all group-hover:text-blue-500" v-else />
        <div class="flex flex-col gap-y-1 items-start">
          <div
            :title="asset.tokenName"
            :class="[asset.isNative ? 'text-lg' : 'text-sm', 'flex items-center gap-x-0.5']"
          >
            {{ asset.tokenName }}
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

      <div class="flex flex-1 flex-col items-end text-xs gap-y-1">
        <template v-if="asset.queryable">
          <!-- balance info -->
          <div v-if="asset.balance">
            <span v-if="asset.contract === 'BRC-20'">
              {{ prettifyTokenBalance(asset.balance.total, asset.decimal, false, asset.symbol) }}
            </span>
            <span v-else-if="asset.contract === 'MetaContract'">
              {{ prettifyTokenBalance(asset.balance.total, asset.decimal, true) }}
            </span>
            <span v-else> {{ asset.balance.total }} {{ asset.symbol }} </span>
          </div>
          <div v-else-if="isLoading">--</div>
          <div v-else-if="balance">
            <span v-if="asset.isNative">
              {{ prettifyTokenBalance(balance.total, asset.decimal, false, asset.symbol) }}
            </span>
            <span v-else>
              {{ prettifyTokenBalance(balance.total, asset.decimal, true) }}
            </span>
          </div>
          <div v-else-if="balanceError" class="text-xs text-red-500 truncate">{{ balanceError }}</div>

          <!-- brc info -->
          <div
            class="text-xs flex items-center justify-between w-4/5 ml-auto truncate"
            v-if="asset.balance?.transferBalance"
          >
            <span class="text-[#909399]">Transferable:</span>
            <span class="text-[#141416] font-bold" :title="asset.balance?.transferBalance.toString()">{{
              asset.balance.transferBalance
            }}</span>
          </div>
          <div
            class="text-xs flex items-center justify-between w-4/5 ml-auto truncate"
            v-if="asset.balance?.availableBalance"
          >
            <span class="text-[#909399]">Available:</span>
            <span class="text-[#141416] font-bold" :title="asset.balance.availableBalance.toString()">{{
              asset.balance.availableBalance
            }}</span>
          </div>

          <!-- USD info -->
          <div v-if="!(asset?.contract === 'BRC-20')">
            <div class="text-xs text-gray-500" v-if="isExchangeRateLoading">--</div>
            <div class="text-xs text-gray-500" v-else-if="exchange">{{ exchange }}</div>
            <div v-else-if="exchangeError" class="text-xs text-red-500 truncate">{{ exchangeError }}</div>
          </div>
        </template>

        <div v-else>--</div>
      </div>
    </div>
  </div>
</template>
