<script lang="ts" setup>
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'

import actions from '../../data/authorize-actions'
const action = actions.EciesEncrypt

const accesses = ['Encrypt a message with ECIES algorithm.']

const props = defineProps<{
  params: {
    message: string
  }
}>()
</script>

<template>
  <h3 class="text-base font-bold">{{ action.title }}</h3>

  <ul class="mt-6 space-y-4">
    <li v-for="access in accesses" class="flex items-start gap-x-2">
      <CheckBadgeIcon class="h-6 w-6 text-primary-blue" />
      <div class="text-sm text-gray-700">{{ access }}</div>
    </li>
  </ul>

  <!-- message -->
  <div class="mt-4 space-y-2">
    <div class="label">message</div>
    <div class="value">{{ params.message }}</div>
  </div>
</template>
