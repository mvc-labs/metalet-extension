<script lang="ts" setup>
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'

import actions from '../../data/authorize-actions'
const action = actions.Disconnect

const accesses = ['Disconnect your Metalet wallet account from this site']
</script>

<template>
  <div class="space-y-6 rounded-lg bg-gray-100 p-4 text-sm">
    <h3 class="text-base font-bold">{{ action.title }}</h3>

    <ul class="space-y-4">
      <li v-for="access in accesses" class="flex items-start gap-x-2">
        <CheckBadgeIcon class="h-6 w-6 text-primary-blue" />
        <div class="text-sm text-gray-700">{{ access }}</div>
      </li>
    </ul>
  </div>
</template>
