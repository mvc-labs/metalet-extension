<script lang="ts" setup>
import { ref, computed } from 'vue'
import { CircleStackIcon, CheckBadgeIcon } from '@heroicons/vue/24/solid'

import { isOfficialToken } from '@/lib/assets'
import { updateAsset } from '@/lib/balance'
import { useBalanceQuery } from '@/queries/balance'
import { prettifyTokenBalance } from '@/lib/formatters'
import { type Asset, getTagInfo, Tag } from '@/data/assets'
import { useExchangeRatesQuery } from '@/queries/exchange-rates'
import Decimal from 'decimal.js'

const { asset, address } = defineProps<{
  asset: Asset
  address: string
}>()

const tag = ref<Tag>()

if (asset?.contract) {
  tag.value = getTagInfo(asset.contract)
}

const enabled = computed(() => !!address && asset.queryable)
const rateEnabled = computed(() => !!address)

const { isLoading, data: balance } = useBalanceQuery(
  ref(address),
  ref(asset.symbol),
  { enabled },
  { contract: asset?.contract, genesis: asset?.genesis }
)

const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery(
  ref(asset.symbol),
  asset?.contract,
  {
    enabled: rateEnabled,
  }
)

const exchange = computed(() => {
  if (balance.value && exchangeRate.value) {

    let usdRate = Number(exchangeRate.value.price)
    console.log('exchange', asset.symbol, { usdRate })

    const usdRate1 = new Decimal(exchangeRate.value.price)
    console.log('exchange1', asset.symbol, { usdRate1: usdRate1.toNumber() })


    if (typeof usdRate !== 'number') {
      usdRate = 0
    }

    let balanceInStandardUnit = balance.value.total / 10 ** asset.decimal
    console.log('exchange', asset.symbol, { balanceInStandardUnit })

    const balanceInStandardUnit1 = new Decimal(balance.value.total).dividedBy(1e8)
    console.log('exchange1', asset.symbol, { balanceInStandardUnit1: balanceInStandardUnit1.toNumber() })


    if (typeof balanceInStandardUnit !== 'number') {
      balanceInStandardUnit = 0
    }

    let exchanged = balanceInStandardUnit * usdRate
    console.log('exchange', asset.symbol, { exchanged })

    const exchanged1 = usdRate1.mul(balanceInStandardUnit1)
    console.log('exchange1', asset.symbol, { exchanged1: exchanged1.toNumber() })

    if (typeof exchanged !== 'number') {
      return '$0.00 USD'
    }

    updateAsset({ name: asset.symbol, value: exchanged })
    return `$${exchanged1.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)} USD`
    return `$${exchanged.toFixed(2)} USD`

  }

  return '$0.00 USD'
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

      <div class="flex flex-col items-end text-xs">
        <template v-if="asset.queryable">
          <div class="" v-if="isLoading">--</div>
          <div class="" v-else-if="balance">
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

          <div class="text-xs text-gray-500" v-if="isExchangeRateLoading">--</div>
          <div class="text-xs text-gray-500" v-else>{{ exchange }}</div>
        </template>

        <template v-else-if="asset.total">
          <div class="whitespace-nowrap">
            {{ prettifyTokenBalance(asset.total, asset.decimal, true) }}
          </div>
        </template>

        <div v-else>--</div>
      </div>
    </div>
  </div>
</template>
