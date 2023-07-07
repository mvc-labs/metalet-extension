<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { computed, ref, Ref } from 'vue'

import { useBalanceQuery } from '../../../queries/balance'
import { useExchangeRatesQuery } from '../../../queries/exchange-rates'
import { prettierBalance } from '../../../lib/helpers'
import { getAddress } from '../../../lib/account'
import { ArrowDownRightIcon, ArrowUpRightIcon, QrCodeIcon } from '@heroicons/vue/20/solid'

const router = useRouter()

const address: Ref<string> = ref('')
getAddress().then((add) => {
  address.value = add!
})

const enabled = computed(() => !!address.value)

const { isLoading, data: balance } = useBalanceQuery(address, 'SPACE', { enabled })
const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery('MVC', { enabled })

const exchange = computed(() => {
  if (balance.value && exchangeRate.value) {
    const usdRate: number = Number(exchangeRate.value.USD)
    const balanceInStandardUnit = balance.value / 10 ** 8
    const exchanged = balanceInStandardUnit * usdRate

    // 保留两位
    return `$${exchanged.toFixed(2)}`
  }

  return '0'
})

function toSelectAsset(purpose: 'receive' | 'send') {
  const selectAssetRoute = {
    name: 'select-asset',
    query: {
      purpose,
    },
  }
  router.push(selectAssetRoute)
}
</script>

<template>
  <div class="pt-4">
    <div class="text-gray-500">Total Balance</div>
    <div class="mt-2 text-3xl font-bold" v-if="isLoading || isExchangeRateLoading">--</div>
    <div class="mt-2 text-3xl font-bold" v-else>
      {{ exchange }}
    </div>

    <!-- 接收和发送按钮 -->
    <div class="mt-4 grid grid-cols-2 gap-2 self-stretch">
      <button @click="toSelectAsset('send')" class="button">
        <ArrowUpRightIcon class="mr-1 h-4 w-4" />
        <span>Send</span>
      </button>
      <button @click="toSelectAsset('receive')" class="button">
        <QrCodeIcon class="mr-1 h-4 w-4" />
        <span>Receive</span>
      </button>
    </div>
  </div>
</template>
<style lang="css" scoped>
.button {
  @apply flex items-center justify-center rounded-md bg-btn-blue py-3 text-sm text-white;
}
</style>
