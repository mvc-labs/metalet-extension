<script lang="ts" setup>
import { ref, computed } from 'vue'
import { CircleStackIcon, CheckBadgeIcon } from '@heroicons/vue/24/solid'

import { useBalanceQuery, getBalance } from '@/queries/balance'
import { isOfficialToken } from '@/lib/assets'
import { prettifyBalance, prettifyTokenBalance } from '@/lib/formatters'
import type { Asset } from '@/data/assets'
import { useExchangeRatesQuery, getExchangeRate } from '@/queries/exchange-rates'

const { asset } = defineProps<{
  asset: Asset
}>()

const address = ref("")

const enabled = computed(() => !!address.value && asset.queryable)
const rateEnabled = computed(() => !!address.value && asset.symbol === 'SPACE')

const { isLoading, data: balance } = useBalanceQuery(address, asset.symbol, { enabled })
const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery('MVC', { enabled: rateEnabled })

const exchange = computed(() => {
  if (balance.value && exchangeRate.value) {
    const usdRate: number = Number(exchangeRate.value.USD)
    const balanceInStandardUnit = balance.value / 10 ** asset.decimal
    const exchanged = balanceInStandardUnit * usdRate

    // 保留两位
    return `$${exchanged.toFixed(2)}`
  }

  return '0'
})
</script>

<template>
  <div class="group relative transition hover:z-10">
    <div class="flex cursor-pointer items-center justify-between rounded-md bg-gray-100 px-4 py-4">
      <div class="flex items-center gap-x-3">
        <img class="h-10 w-10 rounded-full" :src="asset.logo" v-if="asset.logo" />
        <CircleStackIcon class="h-10 w-10 text-gray-300 transition-all group-hover:text-blue-500" v-else />
        <div class="flex flex-col">
          <div :class="[
            'flex w-24 items-center gap-x-0.5 truncate whitespace-nowrap',
            asset.isNative ? 'text-lg' : 'text-sm',
          ]" :title="asset.tokenName">
            {{ asset.tokenName }}
            <CheckBadgeIcon class="h-4 w-4 text-blue-500" v-if="asset?.genesis && isOfficialToken(asset.genesis)" />
          </div>
          <div class="text-xs uppercase text-gray-500" v-if="asset.contract">
            {{ asset.contract }}
          </div>
        </div>
      </div>

      <!-- 余额 -->
      <div class="flex flex-col items-end text-xs">
        <template v-if="asset.queryable">
          <div class="" v-if="isLoading">--</div>
          <div class="" v-else-if="balance">
            {{ prettifyBalance(balance) }}
          </div>

          <div class="text-xs text-gray-500" v-if="isExchangeRateLoading">--</div>
          <div class="text-xs text-gray-500" v-else>{{ exchange }}</div>
        </template>

        <template v-else-if="asset.total">
          <div class="whitespace-nowrap">
            {{ prettifyTokenBalance(asset.total, asset.decimal, true) + ' ' + asset.symbol }}
          </div>
        </template>

        <div v-else>--</div>

        <div class="text-[#909399]">${{ exchangeRate }} USD</div>
      </div>
    </div>
  </div>
</template>
