<script lang="ts" setup>
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'

import actions from '@/data/authorize-actions'
const action = actions.Inscribe

const accesses = ['View your wallet address, balance and activity', 'Request approval for transactions']
</script>

<template>
  <h3 class="text-base font-bold">{{ action.title }}</h3>

  <div class="mt-6 gap-x-2 flex items-center">
    <CheckBadgeIcon class="h-6 w-6 text-primary-blue" />
    <div class="text-sm text-gray-700">{{ action.description }}</div>
  </div>
</template>
