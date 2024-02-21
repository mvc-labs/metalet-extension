<script lang="ts" setup>
import { PropType } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import CopyIcon from '@/assets/icons/copy.svg'
import { toTx, toMempool } from '@/lib/helpers'
import { prettifyTokenBalance } from '@/lib/formatters'
import SuccessIcon from '@/assets/icons/success.svg?url'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/solid'

const router = useRouter()

type SuccessResult = {
  status: 'success'
  txId: string
  fromAddress: string
  toAdddress: string
  amount: number
  token: {
    symbol: string
    decimal: number
  }
}
type FailedResult = {
  status: 'failed'
  message: string
}
type WarningResult = {
  status: 'warning'
  message: string
}
export type TransactionResult = SuccessResult | FailedResult | WarningResult
const props = defineProps({
  isOpenResult: {
    type: Boolean,
    required: true,
  },
  result: {
    type: Object as PropType<undefined | TransactionResult>,
  },
})
const emit = defineEmits(['update:isOpenResult'])

function closeModal() {
  emit('update:isOpenResult', false)
}

function ok() {
  closeModal()
  if (props.result?.status === 'success') {
    router.push('/')
  }
}

const toResultTx = async () => {
  if (!props.result || props.result.status !== 'success') return
  if (props.result.token.symbol === 'BTC') {
    toMempool(props.result.txId)
  } else {
    toTx(props.result.txId)
  }
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
      <div class="flex flex-col justify-center items-center gap-[18px]">
        <img class="w-[54px] h-[54px]" :src="SuccessIcon" alt="" />
        <span class="text-black-primary">Send Successfully</span>
      </div>
    </template>

    <template #body>
      <div class="mt-4 space-y-4" v-if="result && (result.status === 'failed' || result.status === 'warning')">
        <div class="space-y-1">
          <div class="text-sm text-gray-500 break-all">{{ result.message }}</div>
        </div>
      </div>

      <div class="mt-[37px] space-y-4" v-if="result && result.status === 'success'">
        <div class="flex justify-between">
          <div class="label">Amount</div>
          <div class="text-sm">
            {{ `${prettifyTokenBalance(result.amount, result.token.decimal)} ${result.token.symbol}` }}
          </div>
        </div>

        <div class="flex justify-between">
          <div class="label">From</div>
          <div class="text-xs flex gap-2">
            <div class="truncate w-48 cursor-pointer" :title="result.fromAddress">{{ result.fromAddress }}</div>
            <CopyIcon class="h-4 w-4 cursor-pointer hover:text-blue-500" />
          </div>
        </div>

        <div class="flex justify-between">
          <div class="label">To</div>
          <div class="text-xs flex gap-2">
            <div class="truncate w-48 cursor-pointer" :title="result.toAdddress">{{ result.toAdddress }}</div>
            <CopyIcon class="h-4 w-4 cursor-pointer hover:text-blue-500" />
          </div>
        </div>

        <div class="flex justify-between">
          <div class="label">Transaction ID</div>
          <div class="text-xs flex gap-2">
            <div class="hover:underline truncate w-48 cursor-pointer" @click="toResultTx">{{ result.txId }}</div>
            <CopyIcon class="h-4 w-4 cursor-pointer text-blue-300 hover:text-blue-500" />
          </div>
        </div>
      </div>
    </template>

    <template #control>
      <div class="">
        <button class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100 outline-none" @click="ok">
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
