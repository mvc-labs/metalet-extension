<script lang="ts" setup>
import { ref, computed } from 'vue'
import { CircleStackIcon, CheckBadgeIcon } from '@heroicons/vue/24/solid'

import { useBalanceQuery } from '@/queries/balance'
import { isOfficialToken } from '@/lib/assets'
import { prettifyBalance, prettifyTokenBalance } from '@/lib/formatters'
import { type Asset, getTagInfo, Tag } from '@/data/assets'
import { useExchangeRatesQuery } from '@/queries/exchange-rates'
import { getCurrentAccount } from '@/lib/account'
import { getNetwork } from '@/lib/network'

const { asset } = defineProps<{
  asset: Asset
}>()

const chain = computed(() => asset.chain)
const address = ref('')
const tag = ref<Tag>()

getCurrentAccount().then(async (account) => {
  if (!account) return

  const network = await getNetwork()
  if (network === 'mainnet') {
    address.value = account[chain.value].mainnetAddress
  } else {
    address.value = account[chain.value].testnetAddress
  }
})

if (asset?.contract) {
  tag.value = getTagInfo(asset.contract)
}

const enabled = computed(() => !!address.value && asset.queryable)
const rateEnabled = computed(() => !!address.value)

const { isLoading, data: balance } = useBalanceQuery(address, asset.symbol, { enabled })
const { isLoading: isExchangeRateLoading, data: exchangeRate } =
  useExchangeRatesQuery(asset.symbol, { enabled: rateEnabled })

const exchange = computed(() => {
  if (balance.value && exchangeRate.value) {
    const usdRate: number = Number(exchangeRate.value.price)
    const balanceInStandardUnit = balance.value.total / 10 ** asset.decimal
    const exchanged = balanceInStandardUnit * usdRate
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
        <div class="flex flex-col gap-y-1.5">
          <div :class="[
            'flex w-24 items-center gap-x-0.5 truncate whitespace-nowrap',
            asset.isNative ? 'text-lg' : 'text-sm',
          ]" :title="asset.tokenName">
            {{ asset.tokenName }}
            <CheckBadgeIcon class="h-4 w-4 text-blue-500" v-if="asset?.genesis && isOfficialToken(asset.genesis)" />
          </div>
          <div v-if="tag">
            <div :style="`background-color:${tag.bg};color:${tag.color};`"
              :class="['px-1.5', 'py-0.5', 'rounded', 'text-xs', 'inline-block']">{{ tag.name }}</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end text-xs">
        <template v-if="asset.queryable">

          <div class="" v-if="isLoading">--</div>
          <div class="" v-else-if="balance">
            {{ prettifyBalance(balance.total, asset.symbol) }}
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
