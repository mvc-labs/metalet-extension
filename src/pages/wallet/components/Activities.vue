<script lang="ts" setup>
import { ref, computed } from 'vue'
import { type Asset } from '@/data/assets'
import ActivityItem from './ActivityItem.vue'
import { InboxIcon } from '@heroicons/vue/24/solid'
import { useActivitiesQuery } from '@/queries/activities'

const props = defineProps<{
  address: string
  asset: Asset
  exchangeRate?: number
}>()

const address = ref(props.address)
const enabled = computed(() => !!address.value)

const { isLoading, isError, data: activities, error } = useActivitiesQuery(address, props.asset, { enabled })
</script>

<template>
  <div class="text-sm">
    <!-- label -->
    <h4 class="py-2 text-black-primary text-lg ">Transaction History</h4>

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
