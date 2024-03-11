<script lang="ts" setup>
import Decimal from 'decimal.js'
import { Psbt } from 'bitcoinjs-lib'
import { useRoute } from 'vue-router'
import { Wallet } from 'meta-contract'
import { getTags } from '@/data/assets'
import Modal from '@/components/Modal.vue'
import { allAssets } from '@/data/assets'
import { BtcWallet } from '@/lib/wallets/btc'
import { useBalanceQuery } from '@/queries/balance'
import { useQueryClient } from '@tanstack/vue-query'
import { type SymbolTicker } from '@/lib/asset-symbol'
import BTCRateList from './components/BTCRateList.vue'
import type { TransactionResult } from '@/global-types'
import { ref, computed, Ref, inject, toRaw, watch } from 'vue'
import TransactionResultModal from './components/TransactionResultModal.vue'
import { AssetLogo, Divider, FlexBox, FeeRateSelector, Button, Loading } from '@/components'

const tags = computed(() => {
  if (asset.value) {
    return getTags(asset.value)
  }
})

const route = useRoute()
const error = ref<Error>()
const queryClient = useQueryClient()
const address = ref(route.params.address as string)
const symbol = ref(route.params.symbol as SymbolTicker)
const asset = computed(() => allAssets.find((asset) => asset.symbol === symbol.value)!)

// balance
const balaceEnabled = computed(() => {
  return !!address.value && !!asset.value.symbol && !asset.value.balance
})
const { data: balance } = useBalanceQuery(address, symbol, { enabled: balaceEnabled })

const currentRateFee = ref<number | undefined>()

const txPsbt = ref<Psbt>()
const totalFee = ref<number>()

const amount = ref<number>()
const amountInSats = computed(() => {
  if (amount.value && typeof amount.value === 'number') {
    return new Decimal(amount.value).times(1e8)
  }
  return new Decimal(0)
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

watch(amountInSats, (newAmountInSats) => {
  if (balance.value && newAmountInSats && newAmountInSats.gt(balance.value.total)) {
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
      chain: asset.value.symbol === 'SPACE' ? 'mvc' : 'btc',
      status: 'success',
      txId: sentRes.txId,
      fromAddress: address.value,
      toAdddress: recipient.value,
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
  <FlexBox d="col" ai="center" v-if="asset" class="w-full h-full relative space-y-6">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />

    <div class="space-y-4 w-full">
      <FlexBox d="col" ai="center">
        <AssetLogo :logo="asset?.logo" :symbol="symbol" :chain="asset.chain" type="network" />

        <div class="mt-3 text-base">{{ symbol }}</div>

        <div class="space-x-1">
          <div v-for="tag in tags" :key="tag.name" :class="['text-gray-primary', 'text-xs']">
            {{ tag.name }}
          </div>
        </div>
      </FlexBox>

      <Divider />
    </div>

    <div class="space-y-2 w-full">
      <FlexBox ai="center" jc="between">Receiver</FlexBox>
      <textarea
        v-model="recipient"
        class="w-full rounded-lg p-3 text-xs border border-gray-soft focus:border-blue-primary focus:outline-none break-all"
      />
    </div>

    <div class="space-y-2 w-full">
      <FlexBox ai="center" jc="between">
        <span>Amount</span>
        <span class="text-gray-primary text-xs">
          <span>Balance: </span>
          <span v-if="balance">{{ balance.total / 10 ** asset.decimal }} {{ symbol }}</span>
          <span v-else>--</span>
        </span>
      </FlexBox>
      <input
        min="0"
        step="0.00001"
        type="number"
        v-model="amount"
        :max="balance.total / 10 ** asset.decimal"
        class="mt-2 w-full rounded-lg p-3 text-xs border border-gray-soft focus:border-blue-primary focus:outline-none"
      />
    </div>

    <FeeRateSelector class="w-full" v-model:currentRateFee="currentRateFee" v-if="asset.chain === 'btc'" />

    <Button
      type="primary"
      @click="next"
      :disabled="!currentRateFee || !recipient"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 w-61.5 h-12"
      :class="!currentRateFee || !recipient || operationLock ? 'opacity-50 cursor-not-allowed' : undefined"
    >
      <FlexBox ai="center" :gap="1" v-if="operationLock">
        <LoadingIcon />
        <span>Loading...</span>
      </FlexBox>
      <span v-else>Next</span>
    </Button>

    <!-- send -->
    <template v-if="!operationLock">
      <button
        @click="popConfirm"
        v-if="symbol === 'SPACE'"
        :disabled="!recipient || !amountInSats.toNumber() || !!error"
        :class="!recipient || !amountInSats || !!error ? 'opacity-50 cursor-not-allowed' : ''"
        class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100"
      >
        Next
      </button>
      <button
        @click="popConfirm"
        v-else-if="symbol === 'BTC'"
        :disabled="!recipient || !amountInSats.toNumber() || !currentRateFee || !!error"
        class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100"
        :class="!recipient || !amountInSats || !currentRateFee || !!error ? 'opacity-50 cursor-not-allowed' : ''"
      >
        Next
      </button>
    </template>
    <div v-else class="w-full py-3 text-center text-sm font-bold text-gray-500">Loading...</div>

    <Modal v-model:is-open="isOpenConfirmModal" title="Confirm">
      <template #title>
        <div class="text-black-primary font-bold text-center">Confirm Send</div>
      </template>

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
            @click="isOpenConfirmModal = false"
            class="w-full rounded-lg border border-blue-primary bg-white py-3 text-sm font-bold text-gray-700"
          >
            Cancel
          </button>
          <button class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100" @click="send">
            Confirm
          </button>
        </div>
      </template>
    </Modal>
  </FlexBox>
  <Loading text="Asset Loading..." v-else />
</template>

<style lang="css" scoped>
.label {
  @apply text-sm text-gray-500;
}
</style>
