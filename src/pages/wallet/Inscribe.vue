<script lang="ts" setup>
import Decimal from 'decimal.js'
import { ref, computed, Ref } from 'vue'
import { type Psbt } from 'bitcoinjs-lib'
import Ticker from './components/Ticker.vue'
import { BtcWallet } from '@/lib/wallets/btc'
import Loading from '@/components/Loading.vue'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import CopyIcon from '@/assets/icons-v3/copy.svg'
import LoadingIcon from '@/assets/icons-v3/loading.svg'
import { prettifyBalanceFixed, shortestAddress } from '@/lib/formatters'
import { useBRCTickerAseetQuery, useBRC20AssetQuery } from '@/queries/btc'
import { preInscribe, PreInscribe, getInscribeInfo } from '@/queries/inscribe'
import { FlexBox, Divider, FeeRateSelector, Button, AssetLogo } from '@/components'
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

const availableBalance = computed(() => {
  if (tokenData.value) {
    return tokenData.value.tokenBalance.availableBalance
  }
  return '--'
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
  const data = await wallet
    .getFeeAndPsbt(order.payAddress, new Decimal(order.needAmount), currentRateFee.value)
    .catch((err) => {
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
  <div class="h-full" v-if="asset">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
    <div v-if="nextStep === 0" class="h-full space-y-6 relative">
      <Ticker :ticker="asset.symbol" :amount="inscribeAmount || 0" :block="true" class="w-[104px] mx-auto" />
      <Divider />
      <div>
        <FlexBox ai="center" jc="between">
          <span class="text-sm">Available</span>
          <span class="text-xs text-gray-primary"> {{ availableBalance }} {{ asset.symbol }} </span>
        </FlexBox>
        <input
          min="0"
          type="number"
          :max="availableBalance"
          v-model="inscribeAmount"
          class="mt-2 w-full rounded-lg p-3 text-xs border border-gray-soft focus:border-blue-primary focus:outline-none"
        />
      </div>
      <FeeRateSelector class="mt-6" v-model:currentRateFee="currentRateFee" />

      <Button
        type="primary"
        @click="popConfirm"
        :disabled="!currentRateFee || !inscribeAmount"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 w-[246px] h-12"
        :class="!currentRateFee || !inscribeAmount || operationLock ? 'opacity-50 cursor-not-allowed' : undefined"
      >
        <FlexBox ai="center" :gap="1" v-if="operationLock">
          <LoadingIcon />
          <span>Loading...</span>
        </FlexBox>
        <span v-else>Next</span>
      </Button>
    </div>

    <div v-else-if="nextStep === 1" class="relative h-full space-y-4">
      <FlexBox d="col" ai="center" class="space-y-4 py-1">
        <AssetLogo :logo="asset.logo" :chain="asset.chain" :symbol="asset.symbol" type="network" />
        <div class="text-center text-base">{{ inscribeAmount }} {{ asset.symbol }}</div>
      </FlexBox>
      <div class="space-y-2">
        <div class="text-sm">Preview</div>
        <div class="w-full h-[68px] rounded-lg bg-gray-secondary px-3 py-3.5 text-sm break-all">
          {{ `{"p":"brc-20","op":"transfer","tick":"${asset.symbol}","amt":"${inscribeAmount}"}` }}
        </div>
      </div>
      <Divider />
      <div class="mt-8 space-y-4 text-ss">
        <FlexBox ai="center" jc="between">
          <span class="label">Payment Network Fee</span>
          <span>{{ prettifyBalanceFixed(paymentNetworkFee || 0, 'BTC', 8) }}</span>
        </FlexBox>
        <FlexBox ai="center" jc="between">
          <span class="label">Need Amount</span>
          <span>{{ prettifyBalanceFixed(inscribeOrder?.needAmount || 0, 'BTC', 8) }}</span>
        </FlexBox>
        <Divider />
        <FlexBox ai="center" jc="between">
          <span class="label">Total</span>
          <span>{{ prettifyBalanceFixed(total || 0, 'BTC', 8) }}</span>
        </FlexBox>
      </div>
      <Button
        type="primary"
        :loading="true"
        @click="toConfirm"
        :disabled="!currentRateFee || !inscribeAmount"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 w-[246px] h-12"
        :class="!currentRateFee || !inscribeAmount ? 'opacity-50 cursor-not-allowed' : undefined"
      >
        Next
      </Button>
    </div>

    <div v-else-if="nextStep === 2" class="relative h-full space-y-6">
      <div class="space-y-0.5">
        <div class="text-center text-2xl pt-2">{{ inscribeAmount }} {{ asset.symbol }}</div>
        <div class="text-center text-sm text-gray-primary">
          {{ prettifyBalanceFixed(paymentNetworkFee || 0, 'BTC', 8) }} (network fee)
        </div>
      </div>

      <div class="space-y-4">
        <!-- TODO: replace tabs with shadcn -->
        <div class="border-b mt-3 space-x-3 text-base">
          <span
            @click="changeTabIdx(0)"
            class="inline-block pb-2 border-b-2 cursor-pointer"
            :class="tabIdx === 0 ? 'border-blue-primary text-blue-primary' : 'border-white text-black-primary'"
            >Data</span
          >
          <span
            @click="changeTabIdx(1)"
            class="inline-block pb-2 border-b-2 cursor-pointer"
            :class="tabIdx === 1 ? 'border-blue-primary text-blue-primary' : 'border-white text-black-primary'"
            >Hex</span
          >
        </div>
        <div class="space-y-4 text-sm" v-show="tabIdx === 0">
          <div class="space-y-2 rounded-md">
            <div class="text-gray-primary">Inputs</div>
            <FlexBox
              ai="center"
              jc="between"
              v-for="utxo in inputUTXOs"
              class="w-full px-3 py-3.5 bg-gray-secondary rounded-lg"
            >
              <span>{{ shortestAddress(utxo.address) }}</span
              ><span>{{ prettifyBalanceFixed(utxo.value, 'BTC', 8) }}</span>
            </FlexBox>
          </div>
          <div class="space-y-2 rounded-md">
            <div class="text-gray-primary">Outputs</div>
            <FlexBox
              ai="center"
              jc="between"
              v-for="utxo in outputUTXOs"
              class="w-full px-3 py-3.5 bg-gray-secondary rounded-lg"
            >
              <span>{{ shortestAddress(utxo.address) }}</span>
              <span>{{ prettifyBalanceFixed(utxo.value, 'BTC', 8) }}</span>
            </FlexBox>
          </div>
          <div class="space-y-2 rounded-md">
            <div class="label">Network Fee</div>
            <FlexBox class="w-full px-3 py-3.5 bg-gray-secondary rounded-lg">{{
              prettifyBalanceFixed(paymentNetworkFee || 0, 'BTC', 8)
            }}</FlexBox>
          </div>
        </div>
        <div class="space-y-[18px]" v-show="tabIdx === 1">
          <div class="space-y-2 rounded-md">
            <div class="label">Outputs</div>
            <div class="w-full p-4 bg-gray-secondary h-48 rounded-md break-all overflow-y-scroll">
              {{ psbtHex }}
            </div>
          </div>
          <FlexBox ai="center" jc="center" :gap="2" class="cursor-pointer hover:text-blue-primary">
            <span class="text-sm" @click="copyHex">Copy psbt transaction data</span>
            <CopyIcon />
          </FlexBox>
        </div>
      </div>

      <FlexBox ai="center" jc="center" :gap="2" :class="[tabIdx === 1 ? 'absolute bottom-4' : 'pb-6', 'w-full']">
        <Button type="light" @click="cancel" class="w-[119px] h-12">Cancel</Button>
        <Button type="primary" @click="send" class="w-[119px] h-12" :class="operationLock ? 'opacity-50' : undefined">
          <FlexBox ai="center" :gap="1" v-if="operationLock">
            <LoadingIcon />
            <span>Loading...</span>
          </FlexBox>
          <span v-else>Send</span></Button
        >
      </FlexBox>
    </div>
  </div>
  <Loading v-else text="Asset Loading..." />
</template>

<style lang="css" scoped>
.label {
  @apply text-gray-primary text-sm;
}
</style>
