<script lang="ts" setup>
import { PropType } from 'vue'
import { ArrowTopRightOnSquareIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'

import { toTx } from '@/lib/helpers'
import { prettifyTokenBalance } from '@/lib/formatters'
import { getBrowserHost } from '@/lib/host'

import Modal from '@/components/Modal.vue'

type SuccessResult = {
  status: 'success'
  txId: string
  recipient: string
  amount: number
  token: {
    symbol: string
    decimal: number
  }
}
type InscribeSuccessResult = {
  status: 'inscribeSuccess'
  orderId: string
  amount: number
}
type FailedResult = {
  status: 'failed'
  message: string
}
type WarningResult = {
  status: 'warning'
  message: string
}
export type TransactionResult = SuccessResult | FailedResult | WarningResult | InscribeSuccessResult
const props = defineProps({
  isOpenResult: {
    type: Boolean,
    required: true,
  },
  result: {
    type: Object as PropType<undefined | TransactionResult>,
    required: true,
  },
})
const emit = defineEmits(['update:isOpenResult'])

function closeModal() {
  emit('update:isOpenResult', false)
}

const toResultTx = async () => {
  if (!props.result || props.result.status !== 'success') return

  const host = await getBrowserHost()
  toTx(props.result.txId, host as string)
}

const toResultOrder = async () => {
  if (!props.result || props.result.status !== 'inscribeSuccess') return
  window.open('https://www.metalet.space/wallet-api/v3/inscribe/info?orderId=' + props.result.orderId, '_blank')
}
</script>

<template>
  <Modal :is-open="props.isOpenResult" @update:is-open="$emit('update:isOpenResult', $event)">
    <template #title v-if="result && result.status === 'failed'">
      <div class="flex items-center gap-2">
        <span class="text-gray-500">Transaction Failed</span>
        <ExclamationTriangleIcon class="h-5 w-5 text-red-500"></ExclamationTriangleIcon>
      </div>
    </template>
    <template #title v-if="result && result.status === 'warning'">
      <div class="flex items-center gap-2">
        <span class="text-gray-500">Transaction Warning</span>
        <ExclamationTriangleIcon class="h-5 w-5 text-yellow-500"></ExclamationTriangleIcon>
      </div>
    </template>
    <template #title v-if="result && result.status === 'success'">
      <div class="flex items-center gap-2">
        <span class="gradient-text">Sent Successfully</span>
        <span class="">🚀</span>
      </div>
    </template>
    <template #title v-if="result && result.status === 'inscribeSuccess'">
      <div class="flex items-center gap-2">
        <span class="gradient-text">Inscribed Successfully</span>
        <span class="">🚀</span>
      </div>
    </template>

    <template #body v-if="result && (result.status === 'failed' || result.status === 'warning')">
      <div class="mt-4 space-y-4">
        <div class="space-y-1">
          <div class="text-sm text-gray-500">{{ result.message }}</div>
        </div>
      </div>
    </template>

    <template #body v-if="result && result.status === 'success'">
      <div class="mt-4 space-y-4">
        <div class="space-y-1">
          <div class="label">Amount</div>
          <div class="text-sm">
            {{ `${prettifyTokenBalance(result.amount, result.token.decimal)} ${result.token.symbol}` }}
          </div>
        </div>

        <div class="space-y-1">
          <div class="label">Recipient Address</div>
          <div class="text-xs">{{ result.recipient }}</div>
        </div>

        <div class="space-y-1">
          <div class="label">Transaction ID</div>
          <div class="group cursor-pointer break-all text-xs" @click="toResultTx">
            <span class="group-hover:underline">{{ result.txId }}</span>
            <ArrowTopRightOnSquareIcon
              class="ml-1 inline-block h-4 w-4 text-gray-500 transition duration-200 group-hover:text-blue-500"
            ></ArrowTopRightOnSquareIcon>
          </div>
        </div>
      </div>
    </template>

    <template #body v-if="result && result.status === 'inscribeSuccess'">
      <div class="mt-4 space-y-4">
        <div class="space-y-1">
          <div class="label">Amount</div>
          <div class="text-sm">
            {{ result.amount }}
          </div>
        </div>

        <div class="space-y-1">
          <div class="label">Transaction ID</div>
          <div class="group cursor-pointer break-all text-xs" @click="toResultOrder">
            <span class="group-hover:underline">{{ result.orderId }}</span>
            <ArrowTopRightOnSquareIcon
              class="ml-1 inline-block h-4 w-4 text-gray-500 transition duration-200 group-hover:text-blue-500"
            ></ArrowTopRightOnSquareIcon>
          </div>
        </div>
      </div>
    </template>

    <template #control>
      <div class="">
        <button
          class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100 outline-none"
          @click="closeModal"
        >
          OK
        </button>
      </div>
    </template>
  </Modal>
</template>

<style lang="css" scoped>
.label {
  @apply text-sm text-gray-500;
}
</style>
