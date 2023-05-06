<script lang="ts" setup>
import type { TransferTask, Receiver } from '../../../lib/actions/transfer'
import { shortestAddress } from '../../../lib/helpers'

const props = defineProps<{
  task: TransferTask
  receiver: Receiver
}>()

function prettyAmount(task: TransferTask, receiver: Receiver) {
  // 如果没有genesis，说明是space，需要除以10^8
  if (!task.genesis) {
    return Number(receiver.amount) / 1e8 + ' SPACE'
  }

  return receiver.amount
}
</script>

<template>
  <tr>
    <td class="td-cell">{{ task.genesis ? 'Token' : 'SPACE' }}</td>
    <td class="td-cell">{{ prettyAmount(task, receiver) }}</td>
    <td class="td-cell" :title="receiver.address">{{ shortestAddress(receiver.address) }}</td>
  </tr>
</template>

<style scoped>
.td-cell {
  @apply border border-gray-200 py-2 px-4 text-xs text-gray-700;
}
</style>
