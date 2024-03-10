<script lang="ts" setup>
import { ref, computed } from 'vue'
import { type Asset } from '@/data/assets'
import ActivityItem from './ActivityItem.vue'
import Loading from '@/components/Loading.vue'
import { InboxIcon } from '@heroicons/vue/24/solid'
import { useActivitiesQuery } from '@/queries/activities'

const props = defineProps<{
  address: string
  asset: Asset
  exchangeRate?: number
}>()

const address = ref(props.address)
const enabled = computed(() => !!address.value)

const { isLoading, data: activities } = useActivitiesQuery(address, props.asset, { enabled })
</script>

<template>
  <Loading v-if="isLoading" text="Activities Loading..." />

  <ActivityItem
    :asset="asset"
    :activity="activity"
    :key="activity.txid"
    v-else-if="activities"
    v-for="activity in activities"
  />

  <div v-else class="flex flex-col items-center justify-center gap-y-2 pb-4 pt-8 text-center">
    <InboxIcon class="h-8 w-8 text-gray-300" />
    <div class="text-gray-500">No activities</div>
  </div>
</template>
