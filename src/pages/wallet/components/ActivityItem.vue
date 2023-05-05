<script lang="ts" setup>
import type { Activity } from '../../../queries/activities'
import { formatTimestamp, formatTxId, toTx } from '../../../lib/helpers'
import { computed } from 'vue'
import { getBrowserHost } from '../../../lib/host'

const props = defineProps<{
  activity: Activity
}>()

const isConfirmed = computed(() => {
  return props.activity.height !== -1
})

const difference = computed(() => {
  // 通过outcome和income来判断是收入还是支出
  const { outcome, income } = props.activity
  let display
  let displayClass
  if (outcome > income) {
    display = `-${outcome - income}`
    displayClass = 'text-red-500'
  } else if (outcome < income) {
    display = `+${income - outcome}`
    displayClass = 'text-green-500'
  } else {
    display = '-'
    displayClass = 'text-gray-500'
  }

  return {
    display,
    displayClass,
  }
})

const toActivityTx = async () => {
  const { txid } = props.activity
  const host = await getBrowserHost()
  toTx(txid, host as string)
}
</script>

<template>
  <div class="-mx-2 space-y-3 rounded-md bg-gray-100 py-4 px-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-x-2 text-green-500" v-if="isConfirmed">
        <div class="h-2 w-2 rounded-full bg-green-500"></div>
        <div>Confirmed</div>
      </div>

      <div class="flex items-center gap-x-2 text-red-500" v-else>
        <div class="h-2 w-2 rounded-full bg-red-500"></div>
        <div>Unconfirmed</div>
      </div>
      <div :class="['text-sm text-gray-500']">{{ formatTimestamp(activity.time) }}</div>
    </div>

    <div :class="[difference.displayClass, 'text-right  text-lg font-bold']">{{ difference.display }} sats</div>

    <div class="flex items-center justify-end gap-x-2">
      <div class="gradient-bg rounded px-2 py-0.5 text-xs text-white">TX</div>
      <div class="cursor-pointer text-xs text-gray-300 hover:underline" @click="toActivityTx">
        {{ formatTxId(activity.txid) }}
      </div>
    </div>
  </div>
</template>
