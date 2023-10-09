<script lang="ts" setup>
import { Ref, ref, computed } from 'vue'
import { InboxIcon } from '@heroicons/vue/24/solid'

// import { getAddress } from '@/lib/account'
import { createEmit } from '@/lib/emitters'
import { useActivitiesQuery } from '@/queries/activities'
import type { Token } from '@/queries/tokens'

import ActivityItem from './ActivityItem.vue'

const props = defineProps<{
  asset?: Token | any
  exchangeRate?: number
}>()

const address: Ref<string> = ref('')
// getAddress(props.asset.chain).then((add) => {
//   address.value = add!
// })
createEmit<string>('getAddress')(props.asset.chain).then((add) => {
  address.value = add!
})
const enabled = computed(() => !!address.value)

const {
  isLoading,
  isError,
  data: activities,
  error,
} = useActivitiesQuery(
  address,
  props.asset.isNative
    ? {
        type: 'native',
        asset: props.asset,
      }
    : {
        type: 'token',
        token: props.asset,
      },
  { enabled }
)
</script>

<template>
  <div class="text-sm">
    <!-- label -->
    <h4 class="py-2 uppercase" style="color: #303133">Transaction History</h4>

    <!-- list -->
    <div v-if="isLoading" class="py-4 text-center">Loading...</div>

    <div v-else-if="isError" class="py-4 text-center">Error: {{ error }}</div>

    <div v-else-if="activities" class="space-y-2">
      <ActivityItem
        v-if="activities.length"
        v-for="activity in activities"
        :key="activity.txid"
        :activity="activity"
        :asset="asset"
      />

      <div v-else class="flex flex-col items-center justify-center gap-y-2 pb-4 pt-8 text-center">
        <InboxIcon class="h-8 w-8 text-gray-300" />
        <div class="text-gray-500">No activities</div>
      </div>
    </div>
  </div>
</template>
