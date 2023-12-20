<script lang="ts" setup>
import Decimal from 'decimal.js'
import { useRoute } from 'vue-router'
import { Wallet } from 'meta-contract'
import { Psbt } from 'bitcoinjs-lib'
import { useQueryClient } from '@tanstack/vue-query'
import { ref, computed, Ref, inject, toRaw, watch } from 'vue'

import { useBalanceQuery } from '@/queries/balance'
import { prettifyBalance } from '@/lib/formatters'
import type { TransactionResult } from '@/global-types'
import { allAssets } from '@/data/assets'
import { BtcWallet } from '@/lib/wallets/btc'
import { type SymbolTicker } from '@/lib/asset-symbol'
import { FeeRate, useBTCRateQuery } from '@/queries/transaction'

import Modal from '@/components/Modal.vue'
import TransactionResultModal from './components/TransactionResultModal.vue'

const route = useRoute()
const queryClient = useQueryClient()
const error = ref<Error | undefined>()
const address = ref(route.params.address as string)
const symbol = ref(route.params.symbol as SymbolTicker)
const asset = computed(() => allAssets.find((asset) => asset.symbol === symbol.value)!)

// balance
const balaceEnabled = computed(() => {
  return !!address.value && !!asset.value.symbol && !asset.value.balance
})
const { isLoading, data: balance } = useBalanceQuery(address, symbol, { enabled: balaceEnabled })

// rate list query
const { isLoading: rateLoading, data: rateList } = useBTCRateQuery({
  enabled: computed(() => !!address.value && asset.value.chain === 'btc'),
})

const currentRateFee = ref<number | undefined>()
const isCustom = ref(false)
const currentTitle = ref<string>('')
const selectRateFee = (rateFee: number) => {
  currentRateFee.value = rateFee
  isCustom.value = false
}

const selectCustom = () => {
  currentTitle.value = 'Custom'
  currentRateFee.value = undefined
  isCustom.value = true
}

watch(
  rateList,
  (newRateList?: FeeRate[]) => {
    if (newRateList && newRateList[1]) {
      selectRateFee(newRateList[1].feeRate)
    }
  },
  { immediate: true }
)

// fee
const txPsbt = ref<Psbt>()
const totalFee = ref<number>()

// form
const amount = ref<number>()
const amountInSats = computed(() => {
  const _amount = new Decimal(amount.value || 0)
  if (_amount.isNaN()) return new Decimal(0)
  return _amount.times(new Decimal('1e8'))
})
const recipient = ref('')
const transactionResult = ref<TransactionResult | undefined>()

const isOpenConfirmModal = ref(false)
const popConfirm = async () => {
  if (!recipient.value) {
    transactionResult.value = {
      status: 'warning',
      message: "Please input recipient's address.",
    }
    isOpenResultModal.value = true
    return
  }
  if (!amountInSats.value) {
    transactionResult.value = {
      status: 'warning',
      message: 'Please input amount.',
    }
    isOpenResultModal.value = true
    return
  }
  if (!currentRateFee.value && asset.value.chain === 'btc') {
    transactionResult.value = {
      status: 'warning',
      message: 'Please select fee rate.',
    }
    isOpenResultModal.value = true
    return
  }
  if (symbol.value === 'BTC') {
    operationLock.value = true
    const wallet = await BtcWallet.create()
    const result = await wallet
      .getFeeAndPsbt(recipient.value, amountInSats.value, currentRateFee.value)
      .catch((err: Error) => {
        isOpenConfirmModal.value = false
        transactionResult.value = {
          status: 'failed',
          message: err.message,
        }
        isOpenResultModal.value = true
      })
    operationLock.value = false
    if (result) {
      const { fee, psbt } = result
      txPsbt.value = psbt
      totalFee.value = fee
      isOpenConfirmModal.value = true
    }
  } else {
    isOpenConfirmModal.value = true
  }
}

const total = computed(() => {
  if (balance.value?.total) {
    return new Decimal(balance.value.total).dividedBy(1e8)
  }
  return new Decimal(0)
})

watch(amountInSats, (newAmount) => {
  if (balance.value && newAmount.gt(balance.value.total)) {
    error.value = new Error('Insufficient balance')
  } else {
    error.value = undefined
  }
})

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

async function sendBTC() {
  const wallet = await BtcWallet.create()
  if (txPsbt.value) {
    return await wallet.broadcast(txPsbt.value).catch((err: Error) => {
      isOpenConfirmModal.value = false
      transactionResult.value = {
        status: 'failed',
        message: err.message,
      }
      isOpenResultModal.value = true
    })
  } else {
    isOpenConfirmModal.value = false
    transactionResult.value = {
      status: 'failed',
      message: 'No Psbt',
    }
    isOpenResultModal.value = true
  }
}

async function send() {
  if (operationLock.value) return

  operationLock.value = true

  const sendProcessor = asset.value.symbol === 'SPACE' ? sendSpace : sendBTC
  const sentRes = await sendProcessor()

  if (sentRes) {
    isOpenConfirmModal.value = false
    transactionResult.value = {
      status: 'success',
      txId: sentRes.txId,
      recipient: recipient.value,
      amount: amountInSats.value.toNumber(),
      token: {
        symbol: asset.value.symbol,
        decimal: asset.value.decimal,
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
      <input
        class="main-input w-full !rounded-xl !p-4 !text-xs"
        placeholder="Recipient's address"
        v-model="recipient"
      />

      <!-- amount input -->
      <div class="relative">
        <input
          class="main-input w-full !rounded-xl !py-4 !pl-4 !pr-12 !text-xs"
          placeholder="Amount"
          v-model="amount"
        />
        <!-- unit -->
        <div class="absolute right-0 top-0 flex h-full items-center justify-center text-right text-xs text-gray-500">
          <div class="border-l border-solid border-gray-500 px-4 py-1">{{ asset.symbol }}</div>
        </div>
      </div>

      <!-- balance -->
      <div class="flex items-center gap-x-2 text-xs text-gray-500">
        <div class="">Your Balance:</div>
        <div class="" v-if="isLoading">--</div>
        <div class="" v-else-if="balance">{{ prettifyBalance(balance.total, asset.symbol) }}</div>
      </div>

      <!-- error info -->
      <div v-if="error" class="w-full text-sm text-red-500">{{ error.message }}</div>

      <!-- fee rate -->
      <div v-if="asset.chain === 'btc' && !rateLoading && rateList">
        <div class="text-[#909399] mt-[30px] text-sm">Fee Rate</div>

        <div class="grid grid-cols-3 gap-2 text-xs mt-1.5 text-[#141416]">
          <div
            v-for="rate in rateList"
            @click="selectRateFee(rate.feeRate)"
            :class="rate.feeRate === currentRateFee ? 'border-[#1E2BFF]' : 'border-[#D8D8D8]'"
            class="flex flex-col items-center justify-center rounded-md border cursor-pointer h-[100px]"
          >
            <div class="text-xs">{{ rate.title }}</div>
            <div class="mt-1.5 text-sm font-bold">{{ rate.feeRate }} sat/vB</div>
            <div class="mt-1 text-xs text-[#999999]">About</div>
            <div class="text-xs text-[#999999]">{{ rate.desc.replace('About', '') }}</div>
          </div>
          <div
            @click="selectCustom()"
            :class="isCustom ? 'border-[#1E2BFF]' : 'border-[#D8D8D8]'"
            class="flex flex-col items-center justify-center rounded-md border cursor-pointer w-[100px] h-[100px]"
          >
            <div>Custom</div>
          </div>
        </div>
      </div>

      <!-- custom rate input -->
      <input
        min="0"
        type="number"
        v-if="isCustom"
        placeholder="sat/vB"
        v-model="currentRateFee"
        class="main-input w-full !rounded-xl !p-4 !text-xs mt-1"
      />
    </div>

    <!-- send -->
    <template v-if="!operationLock">
      <button
        @click="popConfirm"
        v-if="symbol === 'SPACE'"
        :disabled="!recipient || !amount || !!error"
        :class="!recipient || !amount || !!error ? 'opacity-50 cursor-not-allowed' : ''"
        class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100"
      >
        Next
      </button>
      <button
        @click="popConfirm"
        v-else-if="symbol === 'BTC'"
        :disabled="!recipient || !amount || !currentRateFee || !!error"
        class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100"
        :class="!recipient || !amount || !currentRateFee || !!error ? 'opacity-50 cursor-not-allowed' : ''"
      >
        Next
      </button>
    </template>
    <div v-else class="w-full py-3 text-center text-sm font-bold text-gray-500">Loading...</div>

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
          <div class="space-y-1" v-if="totalFee">
            <div class="label">BTC Total Fee</div>
            <div class="value break-all text-sm">{{ totalFee / 10 ** 8 }} BTC</div>
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
