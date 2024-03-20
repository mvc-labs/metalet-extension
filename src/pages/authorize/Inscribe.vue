<script lang="ts" setup>
import { ref } from 'vue'
import actions from '@/data/authorize-actions'
import CopyIcon from '@/assets/icons/copy.svg'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
const action = actions.Inscribe

const props = defineProps<{
  params: {
    data: {
      feeRate: number
    }
    message: string
  }
}>()

const txHexs = ref<string[]>([])
const error = ref<Error>()
const commitCost = ref<number>(0)
const revealCost = ref<number>(0)

const isShowingDetails = ref(false)
actions.Inscribe.process({ ...props.params, options: { noBroadcast: true } })
  .then(
    ({
      commitTxHex,
      revealTxsHex,
      commitCost: _commitCost,
      revealCost: _revealCost,
    }: {
      commitTxHex: string
      revealTxsHex: string[]
      commitCost: number
      revealCost: number
    }) => {
      txHexs.value = [commitTxHex, ...revealTxsHex]
      commitCost.value = _commitCost
      revealCost.value = _revealCost
    }
  )
  .catch((err: Error) => {
    error.value = err
  })

const copy = (txHex: string) => {
  navigator.clipboard.writeText(txHex)
}
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
    <div class="py-4 space-y-2">
      <div class="flex justify-between">
        <div class="label">Commit Cost</div>
        <div class="text-xs flex gap-2">{{ commitCost / 1e8 }} BTC</div>
      </div>
      <div class="flex justify-between">
        <div class="label">Reveal Cost</div>
        <div class="text-xs flex gap-2">{{ revealCost / 1e8 }} BTC</div>
      </div>
      <div class="flex justify-between">
        <div class="label">Total Cost</div>
        <div class="text-xs flex gap-2">{{ (commitCost + revealCost) / 1e8 }} BTC</div>
      </div>
      <div class="flex justify-between">
        <div class="label">Fee Rate</div>
        <div class="text-xs flex gap-2">{{ params.data.feeRate }} sat/vB</div>
      </div>
      <div class="flex justify-between" v-for="(txHex, i) in txHexs">
        <div class="label">{{ `Tx${i + 1}` }}</div>
        <CopyIcon class="h-4 w-4 cursor-pointer text-blue-300 hover:text-blue-500" @click="copy(txHex)" />
      </div>
    </div>
  </div>
  <template v-else>
    <h3 class="text-base font-bold">{{ action.title }}</h3>

    <div class="value">{{ params.message }}</div>

    <div v-if="error" class="text-red-500 text-xs">{{error.message}}</div>

    <div class="mt-2 flex items-center justify-center" v-else>
      <button
        class="underline decoration-primary-blue text-gray-700 px-4 py-2 mx-auto font-bold decoration underline-offset-4 hover:underline-offset-2 transition-all duration-300"
        @click="isShowingDetails = true"
      >
        View Transaction Details
      </button>
    </div>
  </template>
</template>
