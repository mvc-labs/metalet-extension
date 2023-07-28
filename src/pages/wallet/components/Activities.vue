<script lang="ts" setup>
import { Ref, ref, computed } from 'vue'

import { getAddress } from '@/lib/account'
import { useActivitiesQuery } from '@/queries/activities'
import ActivityItem from './ActivityItem.vue'
import type { Token } from '@/queries/tokens'
import { InboxIcon } from '@heroicons/vue/24/solid'

const address: Ref<string> = ref('')
getAddress().then((add) => {
  address.value = add!
})
const enabled = computed(() => !!address.value)

const props = defineProps<{
  asset?: Token | any
}>()

const { isLoading, isError, data, error } = useActivitiesQuery(address, { asset: props.asset }, { enabled })
</script>

<template>
  <div class="text-sm">
    <!-- label -->
    <h4 class="py-2 uppercase text-gray-500">Activities</h4>

    <!-- list -->
    <div v-if="isLoading" class="py-4 text-center">Loading...</div>

    <div v-else-if="isError" class="py-4 text-center">Error: {{ error }}</div>

    <div v-else-if="data" class="space-y-2">
      <ActivityItem
        v-if="data.length"
        v-for="activity in data"
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
