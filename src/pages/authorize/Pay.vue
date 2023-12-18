<script lang="ts" setup>
import { CheckBadgeIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import { computed, ref } from 'vue'

import actions from '@/data/authorize-actions'
import { TxComposer } from 'meta-contract'
import { prettifyTxId, prettifyBalance } from '@/lib/formatters'
const action = actions.Pay

const props = defineProps<{
  params: {
    transactions: any
  }
}>()

const isShowingDetails = ref(false)
const currentTransactionIndex = ref(0)

const currentTransactionInfo = computed(() => {
  return props.params.transactions[currentTransactionIndex.value]
})

const currentTransaction = computed(() => {
  return TxComposer.deserialize(currentTransactionInfo.value.txComposer)
})

const goPreviousTransaction = () => {
  if (currentTransactionIndex.value > 0) {
    currentTransactionIndex.value--
  }
}

const goNextTransaction = () => {
  if (currentTransactionIndex.value < props.params.transactions.length - 1) {
    currentTransactionIndex.value++
  }
}
console.log({ tx: TxComposer.deserialize(currentTransactionInfo.value.txComposer) })
</script>

<template>
  <div class="bg-white absolute inset-0 p-4 flex flex-col" v-if="isShowingDetails">
    <!-- detail header -->
    <div class="grid grid-cols-6 items-center">
      <div class="col-span-1">
        <button class="rounded-full shadow-md p-2" @click="isShowingDetails = false">
          <ChevronLeftIcon class="h-4 w-4 text-gray-500" aria-hidden="true" />
        </button>
      </div>

      <div class="col-span-4 font-bold text-center">Transaction Details</div>
    </div>

    <!-- detail body -->
    <div class="py-4 grow">
      <div class="label">Message</div>
      <div class="value break-all">{{ currentTransactionInfo?.message }}</div>

      <div class="label mt-4">Transaction Structure</div>
      <div class="grid grid-cols-11 items-center mt-1">
        <div class="col-span-5 bg-sky-50 border-2 border-sky-300 border-dashed p-2 rounded-lg">
          <div class="text-center text-sm font-bold text-sky-900">Inputs</div>
        </div>

        <div class="col-span-1 text-center mx-auto">
          <ChevronDoubleRightIcon class="h-4 w-4 text-gray-500" aria-hidden="true" />
        </div>

        <div class="col-span-5 bg-teal-50 border-2 border-teal-300 border-dashed py-2 px-1 rounded-lg">
          <div class="text-center text-sm font-bold text-teal-900">Outputs</div>
          <div class="mt-2 space-2 text-xs">
            <div
              class="border-2 border-teal-300 bg-teal-100 rounded p-1"
              v-for="output in currentTransaction.getTx().outputs"
            >
              <div class="">Address</div>
              <div class="text-xs text-gray-500 break-all">
                {{ prettifyTxId(output.script.toAddress().toString(), 4) }}
              </div>

              <div class="mt-2">Amount</div>
              <div class="text-xs text-gray-500 break">
                {{ prettifyBalance(output.satoshis) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- detail footer -->
    <div class="flex justify-end items-center gap-4">
      <div class="flex gap-1">
        <button
          class="relative inline-flex items-center rounded-full shadow bg-white p-1 hover:bg-gray-50 disabled:opacity-30"
          @click="goPreviousTransaction"
          :disabled="currentTransactionIndex <= 0"
        >
          <ChevronLeftIcon class="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          class="relative inline-flex items-center rounded-full shadow bg-white p-1 hover:bg-gray-50 disabled:opacity-30"
          @click="goNextTransaction"
          :disabled="currentTransactionIndex >= params.transactions.length - 1"
        >
          <ChevronRightIcon class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div class="text-zinc-500 text-sm text-end">
        #
        <span class="w-6 text-center inline-block">{{ currentTransactionIndex + 1 }}</span>
        of {{ params.transactions.length }} transactions
      </div>
    </div>
  </div>

  <template v-else>
    <h3 class="text-base font-bold">{{ action.title }}</h3>

    <ul class="mt-6 space-y-4">
      <li v-for="access in action.description" class="flex items-start gap-x-2">
        <CheckBadgeIcon class="h-6 w-6 text-primary-blue shrink-0" />
        <div class="text-sm text-gray-700">{{ access }}</div>
      </li>
    </ul>

    <!-- a button to view detail -->
    <div class="mt-2 flex items-center justify-center">
      <button
        class="underline decoration-primary-blue text-gray-700 px-4 py-2 mx-auto font-bold decoration underline-offset-4 hover:underline-offset-2 transition-all duration-300"
        @click="isShowingDetails = true"
      >
        View Transaction Details ({{ params.transactions.length }})
      </button>
    </div>
  </template>
</template>
