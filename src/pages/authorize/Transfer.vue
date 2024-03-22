<script lang="ts" setup>
import actions from '@/data/authorize-actions'
import type { TransferTask } from '@/lib/actions/transfer'
import TransferRow from './components/TransferRow.vue'

const action = actions.Transfer

const props = defineProps<{
  params: {
    tasks: TransferTask[]
  }
}>()
</script>

<template>
  <h3 class="text-base ">Transfer</h3>

  <div class="mt-4">
    <table class="w-full border-collapse rounded-lg text-center">
      <thead class="">
        <tr>
          <th class="th-cell">Asset</th>
          <th class="th-cell">Amount</th>
          <th class="th-cell">Receiver</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(task, taskIndex) in params.tasks" :key="taskIndex">
          <TransferRow
            v-for="(receiver, receiverIndex) in task.receivers"
            :task="task"
            :receiver="receiver"
            :key="receiverIndex"
          />
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.th-cell {
  @apply border border-gray-200 px-4 py-2  text-gray-500;
}
</style>
