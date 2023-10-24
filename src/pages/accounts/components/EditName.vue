<script lang="ts" setup>
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'
import { type Account } from '@/lib/account'
import { createEmit } from '@/lib/emitters'

defineProps(['open'])
const emit = defineEmits(['update:open'])

const currentAccount = ref<Account | null>(null)
createEmit<Account>('getCurrentAccount')().then((acc) => {
  currentAccount.value = acc
})
const name = ref(currentAccount.value?.name)
function updateName() {
  if (currentAccount.value && name.value) {
    createEmit<Account>('updateName')(name.value)
    // accountManager.updateName(name.value)
  }

  // Refresh
  window.location.reload()
}
</script>

<template>
  <Modal :is-open="open" @update:is-open="$emit('update:open', $event)" title="Confirm">
    <template #title>Edit Account Name</template>

    <template #body>
      <div class="mt-8">
        <input type="text" name="name" id="name"
          class="block w-full rounded-md border border-gray-100 px-2 py-1.5 text-gray-900 shadow placeholder:text-gray-400 sm:text-sm sm:leading-6"
          placeholder="Account Name" v-model="name" />
      </div>
    </template>

    <template #control>
      <div class="grid grid-cols-2 gap-x-4">
        <button class="w-full rounded-lg border border-primary-blue bg-white py-3 text-sm font-bold text-gray-700"
          @click="$emit('update:open', false)">
          Cancel
        </button>
        <button class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100" @click="updateName">
          Confirm
        </button>
      </div>
    </template>
  </Modal>
</template>
