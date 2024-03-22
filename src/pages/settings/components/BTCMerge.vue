<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAddress } from '@/lib/account'
import { BtcWallet } from '@/lib/wallets/btc'
import { getBtcUtxos } from '@/queries/utxos'
import { fetchBtcBalance } from '@/queries/balance'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import BTCRateList from '@/pages/wallet/components/BTCRateList.vue'
import TransactionResultModal, { type TransactionResult } from '@/pages/wallet/components/TransactionResultModal.vue'

const utxos = ref()
const address = ref()
const feeRate = ref<number>()
const operationLock = ref(false)
const isOpenResultModal = ref(false)
const transactionResult = ref<TransactionResult | undefined>()

const mergeDisabled = computed(() => {
  return !utxos.value || utxos.value.length < 5 || !feeRate.value || operationLock.value
})

const merge = async () => {
  if (feeRate.value) {
    operationLock.value = true
    const wallet = await BtcWallet.create()
    const { txId } = await wallet.merge(feeRate.value)
    const balance = await fetchBtcBalance(address.value)
    operationLock.value = false
    isOpenResultModal.value = true
    transactionResult.value = {
      chain: 'btc',
      status: 'success',
      txId,
      fromAddress: address.value,
      toAdddress: address.value,
      amount: balance.total,
      token: {
        symbol: 'BTC',
        decimal: 8,
      },
    }
  } else {
    isOpenResultModal.value = true
    transactionResult.value = {
      status: 'warning',
      message: 'Please select fee rate',
    }
  }
}

getAddress('btc').then((_address) => {
  address.value = _address
  getBtcUtxos(_address).then((_utxos) => {
    console.log({ _utxos })

    utxos.value = _utxos
  })
})
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <div class="label">BTC Address</div>
      <div class="value break-all">{{ address }}</div>
    </div>

    <div class="space-y-2">
      <div class="label">UTXO Count</div>
      <div class="value">{{ utxos?.length || '--' }}</div>
    </div>

    <BTCRateList v-model:currentRateFee="feeRate" />

    <button
      @click="merge"
      :disabled="mergeDisabled"
      :class="[
        mergeDisabled ? 'cursor-not-allowed opacity-50' : undefined,
        'bg-primary-blue text-white py-2 rounded-md text-xs w-full flex items-center justify-center gap-x-2',
      ]"
    >
      <ArrowPathIcon class="animate-spin w-4 h-4" v-if="operationLock" />
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
