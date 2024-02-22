<script lang="ts" setup>
import { type Psbt } from 'bitcoinjs-lib'
import { BtcWallet } from '@/lib/wallets/btc'
import CopyIcon from '@/assets/icons/copy.svg'
import { ref, computed, Ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import BTCRateList from './components/BTCRateList.vue'
import { FeeRate, useBTCRateQuery } from '@/queries/transaction'
import { prettifyBalanceFixed, shortestAddress } from '@/lib/formatters'
import { useBRCTickerAseetQuery, useBRC20AssetQuery } from '@/queries/btc'
import { preInscribe, PreInscribe, getInscribeInfo } from '@/queries/inscribe'
import TransactionResultModal, { type TransactionResult } from './components/TransactionResultModal.vue'

const route = useRoute()
const router = useRouter()

if (!route.params.address || !route.params.symbol) {
  router.go(-1)
}

const address = ref<string>(route.params.address as string)
const symbol = ref<SymbolTicker>(route.params.symbol as SymbolTicker)

const { data: btcAssets } = useBRC20AssetQuery(address, { enabled: computed(() => !!address.value) })
const asset = computed(() => {
  if (btcAssets.value && btcAssets.value.length > 0) {
    return btcAssets.value.find((asset) => asset.symbol === symbol.value)
  }
})

const currentRateFee = ref<number | undefined>()

const { data: tokenData } = useBRCTickerAseetQuery(address, symbol, {
  enabled: computed(() => !!address.value),
})

const nextStep = ref(0)

const isOpenResultModal = ref(false)

const operationLock = ref(false)

const inscribeAmount = ref<number | undefined>()
const inscribePsbt = ref<Psbt | undefined>()
const total = ref<number | undefined>()
const paymentNetworkFee = ref<number | undefined>()
const transactionResult: Ref<undefined | TransactionResult> = ref()
const inscribeOrder = ref<PreInscribe | undefined>()
const psbtHex = ref('')
const copied = ref(false)
interface SimpleUTXO {
  address: string
  value: number
}
const inputUTXOs = ref<SimpleUTXO[]>()
const outputUTXOs = ref<SimpleUTXO[]>()
const copyHex = () => {
  navigator.clipboard.writeText(psbtHex.value)
  copied.value = true
}
const popConfirm = async () => {
  if (!address.value) {
    transactionResult.value = {
      status: 'warning',
      message: 'No address.',
    }
    isOpenResultModal.value = true
    return
  }
  if (!inscribeAmount.value) {
    transactionResult.value = {
      status: 'warning',
      message: 'No input amount.',
    }
    isOpenResultModal.value = true
    return
  }
  if (inscribeAmount.value > Number(tokenData.value?.tokenBalance.availableBalance || 0)) {
    transactionResult.value = {
      status: 'warning',
      message: 'Insufficient Balance.',
    }
    isOpenResultModal.value = true
    return
  }
  operationLock.value = true
  const order = await preInscribe(
    address.value,
    currentRateFee.value!,
    // TODO make it to function
    `{"p":"brc-20","op":"transfer","tick":"${asset.value!.symbol}","amt":"${inscribeAmount.value}"}`
  ).catch((err) => {
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }
    isOpenResultModal.value = true
    return
  })
  // console.log({ order })
  if (!order) {
    operationLock.value = false
    return
  }
  const wallet = await BtcWallet.create()
  const data = await wallet.getFeeAndPsbt(order.payAddress, order.needAmount, currentRateFee.value).catch((err) => {
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }
    isOpenResultModal.value = true
    return
  })
  if (!data) {
    operationLock.value = false
    return
  }
  const { fee, psbt, selecedtUTXOs } = data
  inputUTXOs.value = selecedtUTXOs.map((utxo) => ({ address: address.value, value: utxo.satoshis }))
  const tx = psbt.extractTransaction()
  outputUTXOs.value = psbt.txOutputs.map((out) => ({
    address: out.address || '',
    value: out.value,
  }))
  psbtHex.value = psbt.extractTransaction().toHex()
  paymentNetworkFee.value = fee
  inscribePsbt.value = psbt
  // console.log('paymentNetworkFee', paymentNetworkFee.value, order.minerFee)
  inscribeOrder.value = order
  total.value = paymentNetworkFee.value + order.needAmount
  operationLock.value = false
  nextStep.value = 1
}

function toConfirm() {
  nextStep.value = 2
}

async function send() {
  if (operationLock.value) return
  operationLock.value = true
  const wallet = await BtcWallet.create()
  let resStatus = await wallet.commitInscribe(inscribeOrder.value!.orderId, inscribePsbt.value!).catch((err) => {
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }
    isOpenResultModal.value = true
  })
  if (resStatus) {
    const timer = setInterval(async () => {
      if (resStatus!.inscriptionState === 4) {
        clearInterval(timer)
        operationLock.value = false
        toSuceess()
        return
      }
      resStatus = await getInscribeInfo(inscribeOrder.value!.orderId)
    }, 1000)
  }
}

function cancel() {
  nextStep.value = 1
}

const tabIdx = ref<number>(0)
const changeTabIdx = (idx: number) => {
  tabIdx.value = idx
}

function toSuceess() {
  router.push({ name: 'inscribe-success', params: { orderId: inscribeOrder.value!.orderId, symbol: symbol.value } })
}
</script>

<template>
  <div class="pt-8 h-full" v-if="asset">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
    <div v-if="nextStep === 0" class="h-full relative">
      <div class="flex items-end justify-between w-full text-black-primary">
        <span class="text-xs">Available</span>
        <span class="text-sm">
          {{ (tokenData && tokenData.tokenBalance.availableBalance) || 0 }} {{ asset.symbol }}</span
        >
      </div>

      <div class="self-stretch mt-3">
        <input
          min="0"
          type="number"
          v-model="inscribeAmount"
          placeholder="Inscribe amount"
          :max="tokenData?.tokenBalance.availableBalance || 0"
          class="main-input w-full !rounded-xl !p-4 !text-xs"
        />

        <BTCRateList v-if="asset.chain === 'btc'" v-model:currentRateFee="currentRateFee" />

      </div>

      <div
        v-if="operationLock"
        class="w-full py-3 text-center text-sm font-bold text-gray-500 absolute bottom-4 left-0"
      >
        Loading...
      </div>
      <button
        v-else
        @click="popConfirm"
        :disabled="!currentRateFee || !inscribeAmount"
        :class="!currentRateFee || !inscribeAmount ? 'opacity-50 cursor-not-allowed' : ''"
        class="main-btn-bg w-full rounded-lg py-3 teFxt-sm font-bold text-sky-100 absolute bottom-4 left-0"
      >
        Next
      </button>
    </div>

    <div v-else-if="nextStep === 1" class="text-black-primary relative h-full">
      <div class="text-center text-3xl font-bold">{{ inscribeAmount }} {{ asset.symbol }}</div>
      <div class="mt-[30px] text-sm w-full">Preview</div>
      <div class="w-full h-[76px] rounded-sm bg-[#F5F5F5] mt-2 p-3 text-sm break-all">
        {{ `{"p":"brc-20","op":"transfer","tick":"${asset.symbol}","amt":"${inscribeAmount}"}` }}
      </div>
      <div class="mt-8 space-y-5">
        <div class="flex items-center justify-between">
          <span>Payment Network Fee</span><span>{{ prettifyBalanceFixed(paymentNetworkFee || 0, 'BTC', 8) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Need Amount</span><span>{{ prettifyBalanceFixed(inscribeOrder?.needAmount || 0, 'BTC', 8) }}</span>
        </div>
        <hr />
        <div class="flex items-center justify-between">
          <span>Total</span><span>{{ prettifyBalanceFixed(total || 0, 'BTC', 8) }}</span>
        </div>
      </div>
      <button
        @click="toConfirm"
        class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100 absolute bottom-4 left-0"
      >
        Next
      </button>
    </div>

    <div v-if="nextStep === 2" class="text-black-primary h-full">
      <div class="text-center text-base text-[#909399]">Spend Amount</div>
      <div class="text-center text-3xl font-bold mt-3">{{ inscribeAmount }} {{ asset.symbol }}</div>
      <div class="mt-3 text-center text-base text-[#909399]">
        {{ prettifyBalanceFixed(paymentNetworkFee || 0, 'BTC', 8) }} (network fee)
      </div>
      <div class="border-b mt-3 space-x-3 text-base">
        <span
          @click="changeTabIdx(0)"
          class="inline-block pb-[2px] border-b-4 cursor-pointer"
          :class="tabIdx === 0 ? 'border-[#141416] text-black-primary' : 'border-white text-[#909399]'"
          >Data</span
        >
        <span
          @click="changeTabIdx(1)"
          class="inline-block pb-[2px] border-b-4 cursor-pointer"
          :class="tabIdx === 1 ? 'border-[#141416] text-black-primary' : 'border-white text-[#909399]'"
          >Hex</span
        >
      </div>
      <div class="space-y-[18px]" v-show="tabIdx === 0">
        <div class="space-y-2 rounded-md">
          <div class="text-black-primary">Inputs</div>
          <div v-for="utxo in inputUTXOs" class="w-full p-2 bg-[#F5F5F5] flex items-center justify-between">
            <span>{{ shortestAddress(utxo.address) }}</span
            ><span>{{ prettifyBalanceFixed(utxo.value, 'BTC', 8) }}</span>
          </div>
        </div>
        <div class="space-y-2 rounded-md">
          <div class="text-black-primary">Outputs</div>
          <div v-for="utxo in outputUTXOs" class="w-full p-2 bg-[#F5F5F5] flex items-center justify-between">
            <span>{{ shortestAddress(utxo.address) }}</span>
            <span>{{ prettifyBalanceFixed(utxo.value, 'BTC', 8) }}</span>
          </div>
        </div>
        <div class="space-y-2 rounded-md">
          <div class="text-black-primary">Network Fee</div>
          <div class="w-full p-2 bg-[#F5F5F5]">{{ prettifyBalanceFixed(paymentNetworkFee || 0, 'BTC', 8) }}</div>
        </div>
      </div>
      <div class="space-y-[18px]" v-show="tabIdx === 1">
        <div class="space-y-2 rounded-md">
          <div class="text-black-primary">Outputs</div>
          <div class="w-full px-1,5 p-3 bg-[#F5F5F5] h-40 rounded-md overflow-scroll break-all">
            {{ psbtHex }}
          </div>
        </div>
        <div class="space-x-2.5 flex items-center justify-center">
          <CopyIcon :class="copied ? 'text-blue-500' : ''" />
          <span class="text-sm" @click="copyHex">Copy psbt transaction data</span>
        </div>
      </div>
      <div class="w-full left-0 flex items-center space-x-4 mt-4 justify-center">
        <button
          @click="cancel"
          class="border w-[133px] rounded-lg py-3 text-sm font-bold text-black-primary"
          style="border-image: 'linear-gradient(105deg, #72F5F6 4%, #171AFF 94%) 1'"
        >
          Cancel
        </button>
        <button @click="send" class="main-btn-bg w-[133px] rounded-lg py-3 text-sm font-bold text-sky-100">
          Comfirm
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
