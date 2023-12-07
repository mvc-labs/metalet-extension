<script lang="ts" setup>
import { ref, computed, Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useBRCTickerAseetQuery } from '@/queries/btc'
import { useBalanceQuery } from '@/queries/balance'
import { prettifyBalance } from '@/lib/formatters'
import { createEmit } from '@/lib/emitters'
import { BtcWallet } from '@/lib/wallets/btc'
import { BTCAssets } from '@/data/assets'

import Modal from '@/components/Modal.vue'
import { UnisatUTXO } from '@/queries/utxos'
import TransactionResultModal, { type TransactionResult } from './components/TransactionResultModal.vue'

const route = useRoute()
const inscriptionIds = ref<string[]>([])

const selectTicker = (inscriptionId: string) => {
  if (inscriptionIds.value.includes(inscriptionId)) {
    inscriptionIds.value.splice(inscriptionIds.value.findIndex((id) => id === inscriptionId)!, 1)
  } else {
    inscriptionIds.value.push(inscriptionId)
  }
}

const symbol = ref<string>(route.query.symbol as string)
const asset = computed(() => BTCAssets.find((asset) => asset.symbol === symbol.value)!)

const address = ref('')
createEmit<string>('getAddress')('btc').then((addr) => {
  address.value = addr!
})

// balance
const enabled = computed(() => !!address.value)
const { isLoading, data: balance, error } = useBalanceQuery(address, asset.value.symbol, { enabled })

// tickers
const { isLoading: tokenLoading, data: tokenData } = useBRCTickerAseetQuery(address, asset.value.symbol, {
  enabled: computed(() => !!address.value),
})

// form
const amount = ref('')
const recipient = ref('')
const transactionResult: Ref<undefined | TransactionResult> = ref()

const isOpenConfirmModal = ref(false)
const popConfirm = () => {
  isOpenConfirmModal.value = true
}

const isOpenResultModal = ref(false)

const operationLock = ref(false)

// async function sendBrc(utxos: UTXO[]) {
//   const wallet = await BtcWallet.create()
//   const sentRes = await wallet.sendBRC(recipient.value, utxos)
// }

async function send() {
  if (operationLock.value) return

  operationLock.value = true

  // const utxos = await getInscriptionUtxos(inscriptionIds.value)
  // console.log({ utxos })

  // await sendBrc(utxos)

  operationLock.value = false
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center gap-y-8" v-if="asset">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
    <img :src="asset.logo" alt="" class="h-16 w-16 rounded-xl" />

    <div class="space-y-3 self-stretch">
      <!-- address input -->
      <input
        class="main-input w-full !rounded-xl !p-4 !text-xs"
        placeholder="Recipient's address"
        v-model="recipient"
      />

      <!-- balance -->
      <div class="flex items-center gap-x-2 text-xs text-gray-500">
        <div class="">Your Balance:</div>
        <div class="" v-if="isLoading">--</div>
        <div class="" v-else-if="error">Error</div>
        <div class="" v-else-if="balance">{{ prettifyBalance(balance.total, asset.symbol) }}</div>
      </div>

      <div class="grid grid-cols-3 gap-2 mt-4" v-if="!tokenLoading && tokenData && tokenData.transferableList.length">
        <div
          class="flex flex-col items-center rounded-md p-2 cursor-pointer"
          v-for="token in tokenData.transferableList"
          @click="selectTicker(token.inscriptionId)"
          :class="inscriptionIds.includes(token.inscriptionId) ? 'main-btn-bg text-white' : 'bg-gray-100'"
        >
          <div>{{ token.ticker }}</div>
          <div>{{ token.amount }}</div>
          <div>#{{ token.inscriptionNumber }}</div>
        </div>
      </div>
    </div>

    <!-- send -->
    <button
      class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100"
      @click="popConfirm"
      :disabled="!inscriptionIds.length"
    >
      Send
    </button>

    <Modal v-model:is-open="isOpenConfirmModal" title="Confirm">
      <template #title>Confirm Transaction</template>

      <template #body>
        <div class="grid grid-cols-3 gap-2 mt-4" v-if="!tokenLoading && tokenData && tokenData.transferableList.length">
          <div
            class="flex flex-col items-center rounded-md bg-gray-100 p-2"
            v-for="token in tokenData.transferableList"
            :key="token.inscriptionId"
          >
            <div>{{ token.ticker }}</div>
            <div>{{ token.amount }}</div>
            <div>#{{ token.inscriptionNumber }}</div>
          </div>
        </div>
      </template>

      <template #control>
        <div class="" v-if="operationLock">
          <div class="w-full py-3 text-center text-sm font-bold text-gray-500">Operating...</div>
        </div>
        <div class="grid grid-cols-2 gap-x-4" v-else>
          <button
            class="w-full rounded-lg border border-primary-blue bg-white py-3 text-sm font-bold text-gray-700"
            @click="isOpenConfirmModal = false"
          >
            Cancel
          </button>
          <button class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100" @click="send">
            Confirm
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style lang="css" scoped>
.label {
  @apply text-sm text-gray-500;
}
</style>
