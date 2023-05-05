<script lang="ts" setup>
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'

import actions from '../../data/authorize-actions'
const action = actions.EciesDecrypt

const props = defineProps<{
  params: {
    encrypted: string
  }
}>()
</script>

<template>
  <div class="space-y-6 rounded-lg bg-gray-100 p-4 text-sm">
    <h3 class="text-base font-bold">{{ action.title }}</h3>

    <div class="mt-4 flex items-start gap-x-2">
      <CheckBadgeIcon class="h-6 w-6 text-primary-blue" />
      <div class="text-sm text-gray-700">{{ action.description }}</div>
    </div>

    <!-- message -->
    <div class="space-y-2">
      <div class="label">message</div>
      <div class="value">{{ params.encrypted }}</div>
    </div>
  </div>
</template>
