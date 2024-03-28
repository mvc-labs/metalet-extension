<script lang="ts" setup>
import { ref } from 'vue'
import actions from '@/data/authorize-actions'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { MetaidData } from '@/lib/actions/btc/inscribe'
import { ChevronLeftIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'

const action = actions.Inscribe

const props = defineProps<{
  params: {
    data: {
      feeRate: number
      metaidDataList: MetaidData[]
    }
    message: string
  }
}>()

const loading = ref(true)
const error = ref<Error>()
const pastedText = ref<string>()
const commitCost = ref<number>(0)
const revealCost = ref<number>(0)
const commitTxHex = ref<string>()
const revealTxsHex = ref<string[]>([])
const metaidDataList = props.params.data.metaidDataList
metaidDataList.sort((a, b) => {
  if (a.contentType?.includes('image') && !b.contentType?.includes('image')) {
    return -1
  } else if (!a.contentType?.includes('image') && b.contentType?.includes('image')) {
    return 1
  } else {
    return 0
  }
})

const isShowingDetails = ref(false)
actions.Inscribe.process({ ...props.params, options: { noBroadcast: true } })
  .then(
    ({
      commitTxHex: _commitTxHex,
      revealTxsHex: _revealTxsHex,
      commitCost: _commitCost,
      revealCost: _revealCost,
    }: {
      commitTxHex: string
      revealTxsHex: string[]
      commitCost: number
      revealCost: number
    }) => {
      commitCost.value = _commitCost
      revealCost.value = _revealCost
      commitTxHex.value = _commitTxHex
      revealTxsHex.value = _revealTxsHex
    }
  )
  .catch((err: Error) => {
    error.value = err
  }).finally(() => {
    loading.value = false
  })

const copy = (txHex: string) => {
  pastedText.value = txHex
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

      <div class="col-span-4 text-center">Transaction Details</div>
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
      <div class="flex justify-between">
        <div class="label">CommitTx Hex</div>
        <ClipboardDocumentIcon
          @click="copy(commitTxHex!)"
          :class="[pastedText === commitTxHex ? 'text-blue-500' : '', 'h-4 w-4 cursor-pointer hover:text-blue-500']"
        />
      </div>
      <div class="flex justify-between" v-for="(txHex, i) in revealTxsHex">
        <div class="label">{{ `RevealTx${i + 1} Hex` }}</div>
        <ClipboardDocumentIcon
          @click="copy(txHex!)"
          :class="[pastedText === txHex ? 'text-blue-500' : '', 'h-4 w-4 cursor-pointer hover:text-blue-500']"
        />
      </div>
    </div>
  </div>
  <div class="space-y-2" v-else>
    <h3 class="text-base">{{ action.title }}</h3>

    <div class="value">{{ params.message }}</div>
    <div></div>
    <div class="value grid grid-cols-3 gap-4 justify-items-center">
      <template v-for="metaidData in metaidDataList">
        <template v-if="metaidData.body">
          <img
            alt=""
            class="max-w-full"
            v-if="metaidData.contentType?.includes('image')"
            :src="`data:image/jepg;base64,${metaidData.body}`"
          />

          <div v-else class="col-span-3 text-sm">{{ metaidData.body }}</div>
        </template>
      </template>
    </div>

    <div v-if="loading" class="flex items-center justify-center gap-x-2">
      <LoadingIcon class="!text-gray-primary" />
      <span>Data Loading...</span>
    </div>

    <div v-else-if="error" class="text-red-500 text-xs">{{ error.message }}</div>
    <div class="mt-2 flex flex-col items-center justify-center gap-y-2" v-else>
      <div class="flex flex-col w-full gap-y-2">
        <div class="flex justify-between">
          <div class="label">Total Cost</div>
          <div class="text-xs flex gap-2">{{ (commitCost + revealCost) / 1e8 }} BTC</div>
        </div>
        <div class="flex justify-between">
          <div class="label">Fee Rate</div>
          <div class="text-xs flex gap-2">{{ params.data.feeRate }} sat/vB</div>
        </div>
      </div>
      <button
        class="underline decoration-primary-blue text-gray-700 px-4 py-2 mx-auto decoration underline-offset-4 hover:underline-offset-2 transition-all duration-300"
        @click="isShowingDetails = true"
      >
        View Transaction Details
      </button>
    </div>
  </div>
</template>
