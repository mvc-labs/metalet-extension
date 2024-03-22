<script lang="ts" setup>
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'

import actions from '@/data/authorize-actions'
const action = actions.SignBTCMessage

defineProps<{
  params: string
}>()
</script>

<template>
  <h3 class="text-base ">{{ action.title }}</h3>

  <div class="mt-6">
    <CheckBadgeIcon class="h-6 w-6 text-primary-blue inline-block" />
    <span class="text-sm text-gray-700">{{ action.description }}</span>
  </div>

  <!-- message -->
  <div class="mt-4 space-y-2">
    <div class="label">You are signing:</div>
    <div class="value">{{ params }}</div>
  </div>
</template>
