<script lang="ts" setup>
import { computed } from 'vue'

import type { Activity } from '@/queries/activities'
import { prettifyTimestamp, prettifyTxId } from '@/lib/formatters'
import { toTx } from '@/lib/helpers'
import { getBrowserHost } from '@/lib/host'
import { type Chain } from '@/lib/account'
import { type Asset } from '@/data/assets'

const props = defineProps<{
  asset: Asset
  activity: Activity
}>()

const isConfirmed = computed(() => {
  if (props.asset?.contract === 'BRC-20') {
    return true
  }
  return props.activity.height !== -1
})

const difference = computed(() => {
  const { outcome, income } = props.activity
  const { symbol, decimal } = props.asset
  let display
  let displayClass

  if (outcome > income) {
    display = `-${(outcome - income) / 10 ** decimal} ${symbol}`
    displayClass = 'text-red-700'
  } else if (outcome < income) {
    display = `+${(income - outcome) / 10 ** decimal} ${symbol}`
    displayClass = 'text-green-700'
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
  const chain = props.asset.chain as Chain
  const host = await getBrowserHost(chain)
  toTx(txid, host as string)
}
</script>

<template>
  <div class="-mx-2 space-y-3 rounded-md bg-gray-100 px-2 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-x-2 text-green-500" v-if="isConfirmed">
        <div class="h-2 w-2 rounded-full bg-green-500"></div>
        <div>Confirmed</div>
      </div>

      <div class="flex items-center gap-x-2 text-red-500" v-else>
        <div class="h-2 w-2 rounded-full bg-red-500"></div>
        <div>Unconfirmed</div>
      </div>
      <div :class="['text-sm text-gray-500']">{{ prettifyTimestamp(activity.time) }}</div>
    </div>

    <div :class="[difference.displayClass, 'text-right  text-lg font-bold']">{{ difference.display }}</div>

    <div class="flex items-center justify-end gap-x-2">
      <div class="cursor-pointer text-xs text-gray-400 hover:underline" @click="toActivityTx">
        {{ prettifyTxId(activity.txid) }}
      </div>
    </div>
  </div>
</template>
