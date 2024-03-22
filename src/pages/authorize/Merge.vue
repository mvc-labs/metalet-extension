<script lang="ts" setup>
import actions from '@/data/authorize-actions'
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'

const action = actions.Merge
</script>

<template>
  <h3 class="text-base ">{{ action.title }}</h3>

  <div class="mt-8 flex items-start gap-x-2">
    <CheckBadgeIcon class="h-6 w-6 text-primary-blue" />
    <div class="text-sm text-gray-700">{{ action.description }}</div>
  </div>
</template>
