<script lang="ts" setup>
import { ref } from 'vue'
import { Psbt } from 'bitcoinjs-lib'
import { BtcWallet } from '@/lib/wallets/btc'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import { useQueryClient } from '@tanstack/vue-query'
import { getInscriptionUtxo } from '@/queries/utxos'
import BTCRateList from './components/BTCRateList.vue'
import { prettifyBalanceFixed, shortestAddress } from '@/lib/formatters'
import TransactionResultModal, { type TransactionResult } from './components/TransactionResultModal.vue'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

if (!route.query.address || !route.query.symbol || !route.query.inscriptionId || !route.query.amount) {
  router.go(-1)
}

const amount = ref(Number(route.query.amount))
const address = ref<string>(route.query.address as string)
const symbol = ref<SymbolTicker>(route.query.symbol as SymbolTicker)
const inscriptionId = ref<string>(route.query.inscriptionId as string)

const recipient = ref('')

const operationLock = ref(false)
const currentRateFee = ref<number>()
const calcFee = ref<number>()
const txPsbt = ref<Psbt>()

const isOpenResultModal = ref(false)
const isShowComfirm = ref(false)

function cancel() {
  isShowComfirm.value = false
}

const transactionResult = ref<TransactionResult | undefined>()

async function next() {
  if (operationLock.value) return

  if (!currentRateFee.value) {
    transactionResult.value = {
      status: 'warning',
      message: 'Please select fee rate.',
    }
    isOpenResultModal.value = true
    return
  }

  operationLock.value = true

  const utxo = await getInscriptionUtxo(inscriptionId.value)

  const wallet = await BtcWallet.create()
  const info = await wallet.getBRCFeeAndPsbt(recipient.value, utxo, currentRateFee.value).catch((err: Error) => {
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }
    isOpenResultModal.value = true
    operationLock.value = false
  })

  if (info) {
    const { fee, psbt } = info
    calcFee.value = fee
    txPsbt.value = psbt
    operationLock.value = false
    isShowComfirm.value = true
  }
}

async function send() {
  if (!txPsbt.value) {
    transactionResult.value = {
      status: 'warning',
      message: 'No Psbt.',
    }
    isOpenResultModal.value = true
    return
  }

  const wallet = await BtcWallet.create()
  const sentRes = await wallet.broadcast(txPsbt.value).catch((err: Error) => {
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }
    isOpenResultModal.value = true
  })

  if (sentRes) {
    transactionResult.value = {
      status: 'success',
      txId: sentRes.txId,
      fromAddress: address.value,
      toAdddress: recipient.value,
      amount: amount.value,
      token: {
        symbol: symbol.value,
        decimal: symbol.value === 'BTC' ? 8 : 0,
      },
    }

    isOpenResultModal.value = true

    // 刷新query
    queryClient.invalidateQueries({
      queryKey: ['balance', { address: address.value, symbol: symbol.value }],
    })
  }

  operationLock.value = false
}
</script>

<template>
  <div class="pt-[30px] space-y-[30px] h-full">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />

    <!-- send page -->
    <div v-show="!isShowComfirm" class="space-y-4 w-full pb-4">
      <div class="space-y-2">
        <div class="text-[#141416] text-sm">Amount</div>
        <div class="bg-[#F5F5F5] w-full px-3 py-[15px]">{{ amount }} {{ symbol }}</div>
      </div>
      <div class="space-y-2">
        <div class="text-[#141416] text-sm">Receiver</div>
        <input
          v-model="recipient"
          placeholder="Recipient's address"
          class="main-input w-full !rounded-xl !p-4 !text-xs"
        />
      </div>

      <BTCRateList v-model:currentRateFee="currentRateFee" />

      <div v-if="operationLock" class="w-full py-3 text-center text-sm font-bold text-gray-500">Loading...</div>
      <button
        v-else
        @click="next"
        :disabled="!recipient"
        :class="!recipient ? 'opacity-50 cursor-not-allowed' : ''"
        class="main-btn-bg w-full rounded-lg py-3 mt-3 text-sm font-bold text-sky-100"
      >
        Next
      </button>
    </div>

    <!-- comfirm page -->
    <div v-show="isShowComfirm">
      <div class="text-center text-3xl font-bold">{{ amount }} {{ symbol }}</div>
      <div class="mt-8 space-y-5">
        <div class="flex items-center justify-between">
          <span>From</span><span>{{ shortestAddress(address) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>To</span><span>{{ shortestAddress(recipient) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Payment Network Fee</span><span>{{ prettifyBalanceFixed(calcFee || 0, 'BTC', 8) }}</span>
        </div>
      </div>
      <div class="w-full left-0 flex items-center justify-between mt-3">
        <button
          @click="cancel"
          class="border w-[133px] rounded-lg py-3 text-sm font-bold text-[#141416]"
          style="border-image: 'linear-gradient(105deg, #72F5F6 4%, #171AFF 94%) 1'"
        >
          Cancel
        </button>
        <button @click="send" class="main-btn-bg w-[133px] rounded-lg py-3 text-sm font-bold text-sky-100">
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
