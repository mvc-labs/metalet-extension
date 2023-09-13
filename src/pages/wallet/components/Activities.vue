<script lang="ts" setup>
import { Ref, ref, computed } from 'vue'

import { getAddress } from '@/lib/account'
import { useActivitiesQuery } from '@/queries/activities'
import ActivityItem from './ActivityItem.vue'
import type { Token } from '@/queries/tokens'
import { InboxIcon } from '@heroicons/vue/24/solid'
import { getBTActivities, Tx } from '@/queries/btc'

const address: Ref<string> = ref('')
getAddress().then((add) => {
  address.value = add!
})
const enabled = computed(() => !!address.value)

const props = defineProps<{
  asset?: Token | any
  exchangeRate?: number
}>()

const txs = ref<Tx[]>([])

const { isLoading, isError, data, error } = useActivitiesQuery(address, { asset: props.asset }, { enabled })

if (props.asset.chain === 'btc') {
  getBTActivities(props.asset.address).then(transactions => {
    txs.value = transactions
  })
}

function getUSD(balance: number) {
  if (balance && props.exchangeRate) {
    const usdRate: number = Number(props.exchangeRate)
    const balanceInStandardUnit = balance / 10 ** props.asset.decimal
    const exchanged = balanceInStandardUnit * usdRate

    // 保留两位
    return `$${exchanged.toFixed(2)}`
  }

  return '0'
}

</script>

<template>
  <div class="text-sm">
    <!-- label -->
    <h4 class="py-2 uppercase" style="color:#303133">Transaction History</h4>

    <!-- list -->
    <div v-if="isLoading" class="py-4 text-center">Loading...</div>

    <div v-else-if="isError" class="py-4 text-center">Error: {{ error }}</div>

    <div v-else-if="data" class="space-y-2">
      <ActivityItem v-if="data.length && props.asset.chain === 'mvc'" v-for="activity in data" :key="activity.txid"
        :activity="activity" :asset="asset" />
      <div v-else-if="txs.length && props.asset.chain === 'btc'" v-for="tx in txs" :key="tx.txid"
        class="rounded-md py-3.5 px-4" style="background-color: #f5f5f5;">
        <div class="text-lg" style="color:#303133">{{ tx.type === "input" ? "+" : "-" }}{{ getUSD(tx.value) }} USD</div>
        <div class="flex items-center justify-between text-sm" style="color:#909399;">
          <div>{{ tx.type === "input" ? "+" : "-" }}{{ tx.value }} {{ props.asset.symbol }}</div>
          <div>{{ tx.time }}</div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center gap-y-2 pb-4 pt-8 text-center">
        <InboxIcon class="h-8 w-8 text-gray-300" />
        <div class="text-gray-500">No activities</div>
      </div>
    </div>
  </div>
</template>
