<script lang="ts" setup>
import Decimal from 'decimal.js'
import { ref, computed, Ref, inject, toRaw, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Wallet } from 'meta-contract'
import { useQueryClient } from '@tanstack/vue-query'
import { prettifyBalance } from '@/lib/formatters'
import { useBalanceQuery } from '@/queries/balance'
import { createEmit } from '@/lib/emitters'
import { BtcWallet } from '@/lib/wallets/btc'
import { allAssets } from '@/data/assets'

import Modal from '@/components/Modal.vue'
import TransactionResultModal, { type TransactionResult } from './components/TransactionResultModal.vue'

const route = useRoute()
const symbol = ref<string>(route.query.symbol as string)
const asset = computed(() => allAssets.find((asset) => asset.symbol === symbol.value)!)
const queryClient = useQueryClient()

const address = ref('')
createEmit<string>('getAddress')(route.query.chain).then((addr) => {
  address.value = addr!
})

// balance
const enabled = computed(() => !!address.value)
const { isLoading, data: balance, error } = useBalanceQuery(address, asset.value.symbol, { enabled })

// form
const amount = ref('')
const amountInSats = computed(() => {
  const _amount = new Decimal(amount.value || 0);
  if (_amount.isNaN()) return new Decimal(0);
  return _amount.times(new Decimal('1e8'));
})
const recipient = ref('')
const transactionResult = ref<TransactionResult | undefined>()

const isOpenConfirmModal = ref(false)
const popConfirm = () => {
  isOpenConfirmModal.value = true
}

const isOpenResultModal = ref(false)

const wallet = inject<Ref<Wallet>>('wallet')!

const operationLock = ref(false)

async function sendSpace() {
  const walletInstance = toRaw(wallet.value)
  const sentRes = await walletInstance.send(recipient.value, amountInSats.value.toNumber()).catch((err) => {
    isOpenConfirmModal.value = false
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }

    isOpenResultModal.value = true
  })

  return sentRes
}

async function sendBtc() {
  const wallet = await BtcWallet.create()
  const sentRes = await wallet.sendTest(recipient.value, amountInSats.value)
}

async function send() {
  if (operationLock.value) return

  operationLock.value = true

  const sendProcessor = asset.value.symbol === 'SPACE' ? sendSpace : sendBtc
  const sentRes = await sendProcessor()

  if (sentRes) {
    isOpenConfirmModal.value = false
    transactionResult.value = {
      status: 'success',
      txId: sentRes.txId,
      recipient: recipient.value,
      amount: amountInSats.value.toNumber(),
      token: {
        symbol: 'SPACE',
        decimal: 8,
      },
    }

    isOpenResultModal.value = true

    // 刷新query
    queryClient.invalidateQueries({
      queryKey: ['balance', { address: address.value, symbol: asset.value.symbol }],
    })
  }

  operationLock.value = false
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center gap-y-8" v-if="asset">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
    <img :src="asset.logo" alt="" class="h-16 w-16 rounded-xl" />

    <div class="space-y-3 self-stretch">
      <!-- address input -->
      <input class="main-input w-full !rounded-xl !p-4 !text-xs" placeholder="Recipient's address" v-model="recipient" />

      <!-- amount input -->
      <div class="relative">
        <input class="main-input w-full !rounded-xl !py-4 !pl-4 !pr-12 !text-xs" placeholder="Amount" v-model="amount" />
        <!-- unit -->
        <div class="absolute right-0 top-0 flex h-full items-center justify-center text-right text-xs text-gray-500">
          <div class="border-l border-solid border-gray-500 px-4 py-1">{{ asset.symbol }}</div>
        </div>
      </div>

      <!-- balance -->
      <div class="flex items-center gap-x-2 text-xs text-gray-500">
        <div class="">Your Balance:</div>
        <div class="" v-if="isLoading">--</div>
        <div class="" v-else-if="error">Error</div>
        <div class="" v-else-if="balance">{{ prettifyBalance(balance.total, asset.symbol) }}</div>
      </div>
    </div>

    <!-- send -->
    <button class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100" @click="popConfirm">Send</button>

    <Modal v-model:is-open="isOpenConfirmModal" title="Confirm">
      <template #title>Confirm Transaction</template>

      <template #body>
        <div class="mt-4 space-y-4">
          <div class="space-y-1">
            <div class="label">Amount</div>
            <div class="value">{{ amount }} {{ asset.symbol }}</div>
          </div>
          <div class="space-y-1">
            <div class="label">Recipient Address</div>
            <div class="value break-all text-sm">{{ recipient }}</div>
          </div>
          <!-- <div class="space-y-1">
            <div class="label">Network Fee</div>
            <div class="value">100 SPACE</div>
          </div> -->
        </div>
      </template>

      <template #control>
        <div class="" v-if="operationLock">
          <div class="w-full py-3 text-center text-sm font-bold text-gray-500">Operating...</div>
        </div>
        <div class="grid grid-cols-2 gap-x-4" v-else>
          <button class="w-full rounded-lg border border-primary-blue bg-white py-3 text-sm font-bold text-gray-700"
            @click="isOpenConfirmModal = false">
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
