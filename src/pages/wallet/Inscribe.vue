<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { getTags } from '@/data/assets'
import { ref, computed, Ref } from 'vue'
import { SymbolUC } from '@/lib/asset-symbol'
import { type Psbt } from 'bitcoinjs-lib'
import Modal from '@/components/Modal.vue'
import { createEmit } from '@/lib/emitters'
import { BtcWallet } from '@/lib/wallets/btc'
import { prettifyBalance } from '@/lib/formatters'
import { useBalanceQuery } from '@/queries/balance'
import { useBTCRateQuery } from '@/queries/transaction'
import { preInscribe, PreInscribe, getInscribeInfo } from '@/queries/inscribe'
import { useBRCTickerAseetQuery, useBTCAssetQuery } from '@/queries/btc'
import TransactionResultModal, { type TransactionResult } from './components/TransactionResultModal.vue'

const route = useRoute()

const address = ref('')
createEmit<string>('getAddress')('btc').then((addr) => {
  address.value = addr!
})

const symbol = ref<SymbolUC>(route.query.symbol as SymbolUC)
const { data: btcAssets } = useBTCAssetQuery(address, { enabled: computed(() => !!address.value) })
const asset = computed(() => {
  if (btcAssets.value && btcAssets.value.length > 0) {
    return btcAssets.value.find((asset) => asset.symbol === symbol.value)
  }
})
const tags = computed(() => {
  if (asset.value) {
    return getTags(asset.value)
  }
})

const isCustom = ref(false)
const currentRateFee = ref<number | undefined>()

const selectRateFee = (rateFee: number) => {
  currentRateFee.value = rateFee
  isCustom.value = false
}

const selectCustom = () => {
  currentRateFee.value = undefined
  isCustom.value = true
}

const {
  isLoading,
  data: balance,
  error: balanceError,
} = useBalanceQuery(address, symbol, { enabled: computed(() => !!address.value && !!symbol.value) })

const { data: tokenData } = useBRCTickerAseetQuery(address, symbol, {
  enabled: computed(() => !!address.value),
})

// rate list query
const { isLoading: rateLoading, data: rateList } = useBTCRateQuery({ enabled: computed(() => !!address.value) })

const inscribeAmount = ref<number | undefined>()
const inscribePsbt = ref<Psbt | undefined>()
const total = ref<number | undefined>()
const paymentNetworkFee = ref<number | undefined>()
const inscriptionNetworkFee = ref<number | undefined>()
const transactionResult: Ref<undefined | TransactionResult> = ref()
// const wallet = await BtcWallet.create()

// const inscribeOrder = ref<InscribeOrder | undefined>()
const inscribeOrder = ref<PreInscribe | undefined>()
const isOpenConfirmModal = ref(false)
const popConfirm = async () => {
  if (!address.value) {
    throw new Error('No Address')
  }
  if (!tokenData.value?.tokenBalance?.ticker) {
    throw new Error('No ticker')
  }
  if (!inscribeAmount.value) {
    throw new Error('No amount')
  }
  if (!currentRateFee.value) {
    throw new Error('No rate fee')
  }
  operationLock.value = true
  const order = await preInscribe(
    address.value,
    currentRateFee.value,
    // TODO make it to function
    `{"p":"brc-20","op":"transfer","tick":"${tokenData.value.tokenBalance.ticker}","amt":"${inscribeAmount.value}"}`
  )
  console.log({ order })
  const wallet = await BtcWallet.create()
  const { fee, psbt } = await wallet.getFeeAndPsbt(order.payAddress, order.needAmount, currentRateFee.value)
  paymentNetworkFee.value = fee
  inscribePsbt.value = psbt
  console.log('paymentNetworkFee', paymentNetworkFee.value, order.minerFee)
  inscribeOrder.value = order
  total.value = paymentNetworkFee.value + order.needAmount
  console.log('total', total.value)
  inscriptionNetworkFee.value = total.value - order.serviceFee - 546
  console.log('inscriptionNetworkFee', inscriptionNetworkFee.value)
  operationLock.value = false
  isOpenConfirmModal.value = true
}

const isOpenResultModal = ref(false)

const operationLock = ref(false)

async function send() {
  if (operationLock.value) return

  operationLock.value = true
  const wallet = await BtcWallet.create()
  // await wallet.send(inscribeOrder.value!.payAddress, inscribeOrder.value!.totalFee, currentRateFee.value)
  let resStatus = await wallet.commitInscribe(inscribeOrder.value!.orderId, inscribePsbt.value!).catch((e) => {
    console.error(e)
  })
  if (resStatus === undefined) {
    return
  }
  const timer = setInterval(async () => {
    if (resStatus!.inscriptionState === 4) {
      clearInterval(timer)
      operationLock.value = false
      isOpenConfirmModal.value = false
      return
    }
    resStatus = await getInscribeInfo(inscribeOrder.value!.orderId)
  }, 1000)
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center gap-y-8" v-if="asset">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
    <img :src="asset.logo" alt="" class="h-16 w-16 rounded-xl" />

    <!-- TODO reusable component -->
    <div class="mt-1.5 flex items-center gap-x-1.5">
      <div
        v-for="tag in tags"
        :key="tag.name"
        :style="`background-color:${tag.bg};color:${tag.color};`"
        :class="['px-1.5', 'py-0.5', 'rounded', 'text-xs']"
      >
        {{ tag.name }}
      </div>
    </div>

    <div class="space-y-3 self-stretch">
      <!-- inscribe amount input -->
      <input
        min="0"
        type="number"
        v-model="inscribeAmount"
        placeholder="Inscribe amount"
        :max="tokenData?.tokenBalance.availableBalance || 0"
        class="main-input w-full !rounded-xl !p-4 !text-xs"
      />

      <!-- TODO reusable component -->
      <div class="text-xs text-gray-500">
        <div class="" v-if="isLoading">--</div>
        <div class="" v-else-if="balanceError">Error</div>
        <div class="" v-else-if="balance">
          Available: {{ tokenData?.tokenBalance.availableBalance || 0 }} {{ tokenData?.tokenBalance.ticker }}
        </div>
      </div>

      <div class="grid grid-cols-4 gap-2 mt-4 text-xs" v-if="!rateLoading && rateList.list">
        <div
          v-for="rate in rateList.list"
          @click="selectRateFee(rate.feeRate)"
          class="flex flex-col items-center justify-center rounded-md p-2 cursor-pointer"
          :class="rate.feeRate === currentRateFee ? 'main-btn-bg text-white' : 'bg-gray-100'"
        >
          <div>{{ rate.title }}</div>
          <div>{{ rate.feeRate }} sat/vB</div>
          <div>#{{ rate.desc }}</div>
        </div>
        <div
          @click="selectCustom()"
          :class="isCustom ? 'main-btn-bg text-white' : 'bg-gray-100'"
          class="flex flex-col items-center justify-center rounded-md p-2 cursor-pointer"
        >
          <div>Custom</div>
        </div>
      </div>
    </div>

    <input
      min="0"
      type="number"
      v-if="isCustom"
      placeholder="sat/vB"
      v-model="currentRateFee"
      class="main-input w-full !rounded-xl !p-4 !text-xs mt-1"
    />

    <!-- send -->
    <div class="" v-if="operationLock">
      <div class="w-full py-3 text-center text-sm font-bold text-gray-500">Loading...</div>
    </div>
    <button
      v-else
      @click="popConfirm"
      :disabled="!(currentRateFee && inscribeAmount)"
      class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100"
    >
      Inscribe
    </button>

    <Modal v-model:is-open="isOpenConfirmModal" title="Confirm">
      <template #title>Inscribe TRANSFER</template>

      <template #body>
        <div class="space-y-1">
          <div>{{ inscribeAmount }} {{ tokenData?.tokenBalance.ticker }}</div>
          <div>Preview</div>
          <div>
            {{ `{"p":"brc-20","op":"transfer","tick":"${tokenData?.tokenBalance.ticker}","amt":"${inscribeAmount}"}` }}
          </div>
          <div class="flex items-center justify-between">
            <span>Payment Network Fee</span><span>{{ prettifyBalance(paymentNetworkFee || 0, 'BTC') }}</span>
          </div>
          <!-- <div class="flex items-center justify-between">
            <span>Inscription Output Value</span> -->
          <!-- <span>{{ prettifyBalance(inscribeOrder?.outputValue || 0, 'BTC') }} </span> -->
          <!-- <span>{{ prettifyBalance(546, 'BTC') }} </span>
          </div> -->
          <!-- <div class="flex items-center justify-between">
            <span>Inscription Network Fee</span><span>{{ prettifyBalance(inscriptionNetworkFee || 0, 'BTC') }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Service Fee</span><span>{{ prettifyBalance(inscribeOrder?.serviceFee || 0, 'BTC') }}</span>
          </div> -->
          <div class="flex items-center justify-between">
            <span>Need Amount</span><span>{{ prettifyBalance(inscribeOrder?.needAmount || 0, 'BTC') }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Total</span><span>{{ prettifyBalance(total || 0, 'BTC') }}</span>
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

<style lang="css" scoped></style>
