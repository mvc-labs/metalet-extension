<script lang="ts" setup>
import { Ref, ref } from 'vue'

import actions from '../../data/authorize-actions'

const action = actions.TokenTransfer

const props = defineProps<{
  params: any
}>()

const fee: Ref<number | string> = ref('--')
action
  .estimate({
    codehash: props.params.codehash,
    genesis: props.params.genesis,
    receivers: props.params.receivers,
  })
  .then((f: any) => {
    fee.value = f
  })
</script>

<template>
  <ul class="space-y-4 rounded-lg bg-gray-100 p-4 text-sm">
    <h3 class="text-base font-bold">{{ action.title }}</h3>
    <div class="space-y-2">
      <div class="">
        <div class="label">codehash</div>
        <div class="value">{{ params.codehash }}</div>
      </div>

      <div class="">
        <div class="label">genesis</div>
        <div class="value">{{ params.genesis }}</div>
      </div>

      <div class="">
        <div class="label">receiver address</div>
        <div class="value" :title="params.receivers[0].address">
          {{ params.receivers[0].address }}
        </div>
      </div>

      <div class="">
        <div class="label">amount</div>
        <div class="value">
          {{ params.receivers[0].amount }}
        </div>
      </div>
    </div>

    <!-- additional -->
    <div class="text-sm text-gray-500">
      Estimated Fee: <span class="text-primary-blue">{{ fee }} sats</span>
    </div>
  </ul>
</template>
