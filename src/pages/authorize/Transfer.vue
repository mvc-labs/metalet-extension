<script lang="ts" setup>
import { Ref, ref } from 'vue'

import actions from '../../data/authorize-actions'
import type { TransferTask } from '../../lib/actions/transfer'

const action = actions.Transfer

const props = defineProps<{
  params: {
    tasks: TransferTask[]
  }
}>()
</script>

<template>
  <ul class="h-64 space-y-4 overflow-y-auto rounded-lg bg-gray-100 p-4 text-sm">
    <h3 class="text-base font-bold">Transfer</h3>
    <div class="space-y-4" v-for="(task, index) in params.tasks" :key="index">
      <div class="space-y-2" v-for="receiver in task.receivers">
        <div class="">
          <div class="label">receiver address</div>
          <div class="value" :title="receiver.address">
            {{ receiver.address }}
          </div>
        </div>

        <div class="">
          <div class="label">amount</div>
          <div class="value">
            {{ receiver.amount }}
          </div>
        </div>
      </div>
    </div>
  </ul>
</template>
