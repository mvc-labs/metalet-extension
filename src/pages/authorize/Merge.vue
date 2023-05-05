<script lang="ts" setup>
import actions from '../../data/authorize-actions'
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'

const action = actions.Merge
</script>

<template>
  <ul class="h-48 space-y-4 overflow-y-auto rounded-lg bg-gray-100 p-4 text-sm">
    <h3 class="text-base font-bold">{{ action.title }}</h3>

    <div class="mt-4 flex items-start gap-x-2">
      <CheckBadgeIcon class="h-6 w-6 text-primary-blue" />
      <div class="text-sm text-gray-700">{{ action.description }}</div>
    </div>
  </ul>
</template>
