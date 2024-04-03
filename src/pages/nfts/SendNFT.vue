<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Copy from '@/components/Copy.vue'
import type { Psbt } from 'bitcoinjs-lib'
import { BtcWallet } from '@/lib/wallets/btc'
import { getMetaPin } from '@/queries/metaPin'
import { useQueryClient } from '@tanstack/vue-query'
import { UTXO, getInscriptionUtxo } from '@/queries/utxos'
import BTCRateList from '../wallet/components/BTCRateList.vue'
import { prettifyBalanceFixed, shortestAddress } from '@/lib/formatters'
import TransactionResultModal, { type TransactionResult } from '../wallet/components/TransactionResultModal.vue'

const route = useRoute()
const queryClient = useQueryClient()

const id = ref(route.params.id as string)
const imgUrl = ref(route.query.imgUrl as string)
const content = ref(route.query.content as string)
const satoshis = ref(route.query.satoshis as string)
const nftType = route.params.nftType as string
const address = ref<string>(route.params.address as string)

const symbol = 'BTC'
const amount = ref(0)

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

  let utxo: UTXO

  if (nftType === 'brc20') {
    utxo = await getInscriptionUtxo(id.value)
  } else if (nftType === 'metaPin') {
    const metaPin = await getMetaPin(id.value)
    const [txId, outputIndex] = metaPin.output.split(':')
    utxo = {
      txId,
      outputIndex: Number(outputIndex),
      satoshis: metaPin.outputValue,
      confirmed: metaPin.genesisHeight > 0,
      inscriptions: null,
    }
  } else {
    throw new Error('Unknown nft type')
  }

  amount.value = utxo.satoshis

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
      chain: 'btc',
      status: 'success',
      txId: sentRes.txId,
      fromAddress: address.value,
      toAdddress: recipient.value,
      amount: amount.value,
      token: {
        symbol: symbol,
        decimal: symbol === 'BTC' ? 8 : 0,
      },
    }

    isOpenResultModal.value = true

    // 刷新query
    queryClient.invalidateQueries({
      queryKey: ['balance', { address: address.value, symbol }],
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
        <div class="grid grid-cols-3 gap-3">
          <div
            class="flex items-center justify-center rounded-md p-2 bg-[#F5F5F5] relative aspect-square w-full overflow-hidden"
          >
            <img alt="" :src="imgUrl" v-if="imgUrl" class="w-full h-full" />
            <div class="text-xs overflow-hidden line-clamp-6 break-all" :title="content" v-else>
              {{ content }}
            </div>
            <span class="absolute rounded right-0 bottom-1 py-3px px-1.5 bg-[#EBECFF] text-[#787FFF] text-xs scale-75"
              >{{ satoshis }} sat</span
            >
          </div>
        </div>
      </div>
      <div class="space-y-2">
        <div class="text-black-primary text-sm">Receiver</div>
        <input
          v-model="recipient"
          placeholder="Recipient's address"
          class="main-input w-full !rounded-xl !p-4 !text-xs"
        />
      </div>

      <BTCRateList v-model:currentRateFee="currentRateFee" />

      <div v-if="operationLock" class="w-full py-3 text-center text-sm text-gray-500">Loading...</div>
      <button
        v-else
        @click="next"
        :disabled="!recipient"
        :class="!recipient ? 'opacity-50 cursor-not-allowed' : ''"
        class="main-btn-bg w-full rounded-lg py-3 mt-3 text-sm text-sky-100"
      >
        Next
      </button>
    </div>

    <!-- comfirm page -->
    <div v-show="isShowComfirm" class="h-full flex flex-col">
      <div class="grid grid-cols-3 gap-3">
        <div
          class="flex items-center justify-center rounded-md p-2 bg-[#F5F5F5] relative aspect-square w-full overflow-hidden"
        >
          <img alt="" :src="imgUrl" v-if="imgUrl" class="w-full h-full" />
          <div class="text-xs overflow-hidden line-clamp-6 break-all" :title="content" v-else>
            {{ content }}
          </div>
          <span class="absolute rounded right-0 bottom-1 py-3px px-1.5 bg-[#EBECFF] text-[#787FFF] text-xs scale-75"
            >{{ satoshis }} sat</span
          >
        </div>
      </div>
      <div class="mt-8 space-y-5 relative flex-1">
        <div class="flex items-center justify-between">
          <span>From</span>
          <span class="flex items-center gap-x-2">
            <span :title="address">{{ shortestAddress(address) }}</span>
            <Copy :text="address" />
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span>To</span>
          <span class="flex items-center gap-x-2">
            <span :title="recipient">{{ shortestAddress(recipient) }}</span>
            <Copy :text="recipient" />
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span>Network Fee</span><span>{{ prettifyBalanceFixed(calcFee || 0, 'BTC', 8) }}</span>
        </div>
        <div class="w-full left-0 flex items-center justify-center gap-x-4 absolute bottom-5">
          <button
            @click="cancel"
            class="border w-[133px] rounded-lg py-3 text-sm text-black-primary"
            style="border-image: 'linear-gradient(105deg, #72F5F6 4%, #171AFF 94%) 1'"
          >
            Cancel
          </button>
          <button @click="send" class="main-btn-bg w-[133px] rounded-lg py-3 text-sm text-sky-100">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
