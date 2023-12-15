<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { BtcWallet } from '@/lib/wallets/btc'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import { getInscriptionUtxo } from '@/queries/utxos'
import { FeeRate, useBTCRateQuery } from '@/queries/transaction'
import TransactionResultModal, { type TransactionResult } from './components/TransactionResultModal.vue'

const route = useRoute()
const router = useRouter()

if (!route.query.address || !route.query.symbol || !route.query.inscriptionId || !route.query.amount) {
  console.log(route.query)
  router.go(-1)
}

const amount = ref(Number(route.query.amount))
const address = ref<string>(route.params.address as string)
const symbol = ref<SymbolTicker>(route.query.symbol as SymbolTicker)
const inscriptionId = ref<string>(route.params.inscriptionId as string)

const recipient = ref('')

const operationLock = ref(false)

const isCustom = ref(false)
const currentTitle = ref<string>('')
const currentRateFee = ref<number | undefined>()

const selectRateFee = (rateFee: number) => {
  currentRateFee.value = rateFee
  isCustom.value = false
}

const selectCustom = () => {
  currentTitle.value = 'Custom'
  currentRateFee.value = undefined
  isCustom.value = true
}

// rate list query
const { isLoading: rateLoading, data: rateList } = useBTCRateQuery({
  enabled: computed(() => !!address.value),
})

watch(
  rateList,
  (newRateList?: FeeRate[]) => {
    if (newRateList && newRateList[1]) {
      selectRateFee(newRateList[1].feeRate)
    }
  },
  { immediate: true }
)

const isOpenResultModal = ref(false)
const transactionResult = ref<TransactionResult | undefined>()

async function send() {
  if (operationLock.value) return

  operationLock.value = true

  const utxo = await getInscriptionUtxo(inscriptionId.value)

  const wallet = await BtcWallet.create()
  wallet.sendBRC(recipient.value, utxo, currentRateFee.value).catch((err: Error) => {
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }
    isOpenResultModal.value = true
  })

  operationLock.value = false
}
</script>

<template>
  <div class="pt-[30px] space-y-[30px] h-full relative">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />

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

    <div v-if="!rateLoading && rateList">
      <div class="text-[#909399] mt-[30px] text-sm">Fee Rate</div>

      <div class="grid grid-cols-3 gap-2 text-xs mt-1.5 text-[#141416]">
        <div
          v-for="rate in rateList"
          @click="selectRateFee(rate.feeRate)"
          :class="rate.feeRate === currentRateFee ? 'border-[#1E2BFF]' : 'border-[#D8D8D8]'"
          class="flex flex-col items-center justify-center rounded-md border cursor-pointer w-[100px] h-[100px]"
        >
          <div class="tex-sm">{{ rate.title }}</div>
          <div class="mt-1.5 text-base font-bold">{{ rate.feeRate }} sat/vB</div>
          <div class="mt-1 text-sm text-[#999999]">About</div>
          <div class="text-sm text-[#999999]">{{ rate.desc.replace('About', '') }}</div>
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

    <div v-if="operationLock" class="w-full py-3 text-center text-sm font-bold text-gray-500 absolute bottom-4 left-0">
      Loading...
    </div>
    <button
      v-else
      @click="send"
      :disabled="!recipient"
      :class="!recipient ? 'opacity-50 cursor-not-allowed' : ''"
      class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100 absolute bottom-4"
    >
      Send
    </button>
  </div>
</template>

<style lang="css" scoped></style>
