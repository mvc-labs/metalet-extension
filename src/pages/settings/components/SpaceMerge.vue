<script setup lang="ts">
import { computed, ref } from 'vue'
import { FEEB } from '@/data/config'
import { getApiHost } from '@/lib/host'
import { getNetwork } from '@/lib/network'
import { getPrivateKey, getAddress } from '@/lib/account'
import { API_NET, API_TARGET, Wallet } from 'meta-contract'
import { useMVCUTXOQuery } from '@/queries/utxos'
import { fetchSpaceBalance } from '@/queries/balance'
import TransactionResultModal, { type TransactionResult } from '@/pages/wallet/components/TransactionResultModal.vue'

const address = ref()
const isOpenResultModal = ref(false)
const transactionResult = ref<TransactionResult | undefined>()

const merge = async () => {
  const network: API_NET = (await getNetwork()) as API_NET
  const purse = await getPrivateKey('mvc')
  const apiHost = await getApiHost()
  const wallet = new Wallet(purse, network, FEEB, API_TARGET.MVC, apiHost)
  let { txId } = await wallet.merge().catch((err) => {
    isOpenResultModal.value = true
    transactionResult.value = {
      status: 'warning',
      message: err.message,
    }
    throw err
  })
  isOpenResultModal.value = true
  const balance = await fetchSpaceBalance(address.value)
  transactionResult.value = {
    chain: 'mvc',
    status: 'success',
    txId,
    fromAddress: address.value,
    toAdddress: address.value,
    amount: balance.total,
    token: {
      symbol: 'SPACE',
      decimal: 8,
    },
  }
}

getAddress('mvc').then((_address) => {
  address.value = _address
})

const { data } = useMVCUTXOQuery(address, { enabled: computed(() => !!address.value) })
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <div class="label">MVC Address</div>
      <div class="value">{{ address }}</div>
    </div>

    <div class="space-y-2">
      <div class="label">UTXO Count</div>
      <div class="value">{{ data?.length ? (data.length >= 300 ? '>=300' : data.length) : '--' }}</div>
    </div>

    <button
      @click="merge"
      :disabled="!data || data.length < 3"
      :class="[
        'bg-primary-blue text-white py-2 rounded-md text-xs w-full',
        !data || data.length < 3 ? 'cursor-not-allowed opacity-50' : null,
      ]"
    >
      Merge
    </button>
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
  </div>
</template>

<style lang="css" scoped>
.label {
  @apply text-sm  text-gray-500;
}

.value {
  @apply text-sm text-gray-700;
}
</style>
