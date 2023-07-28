<script lang="ts" setup>
import { PropType } from 'vue'
import { ArrowTopRightOnSquareIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'

import { toTx } from '@/lib/helpers'
import { getBrowserHost } from '@/lib/host'

import Modal from '@/components/Modal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

type SuccessResult = {
  status: 'success'
  txId: string
  recipient: string
  nft: {
    name: string
    tokenIndex: number
    cover: string
  }
}
type FailedResult = {
  status: 'failed'
  message: string
}
export type TransactionResult = SuccessResult | FailedResult
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
  router.push('/')
}

const toResultTx = async () => {
  if (!props.result || props.result.status !== 'success') return

  const host = await getBrowserHost()
  toTx(props.result.txId, host as string)
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
    <template #title v-if="result && result.status === 'success'">
      <div class="flex items-center gap-2">
        <span class="gradient-text">Sent Successfully</span>
        <span class="">🚀</span>
      </div>
    </template>

    <template #body v-if="result && result.status === 'failed'">
      <div class="mt-4 space-y-4">
        <div class="space-y-1">
          <div class="text-sm text-gray-500">{{ result.message }}</div>
        </div>
      </div>
    </template>

    <template #body v-if="result && result.status === 'success'">
      <div class="mt-4 space-y-4">
        <div class="flex items-center gap-4 rounded-md bg-gray-100 p-4">
          <div class="h-12 w-12 overflow-hidden rounded">
            <img :src="result.nft.cover" class="object-cover" />
          </div>

          <div class="">
            <h3 class="text-sm font-bold">{{ result.nft.name }}</h3>
            <div class="text-xs text-gray-500">{{ '# ' + result.nft.tokenIndex }}</div>
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
