<script lang="ts" setup>
import { ref } from 'vue'
import accountManager from '@/lib/account'

import AccountItem from './components/Item.vue'
import { PlusIcon } from '@heroicons/vue/20/solid'

const accounts = ref()
accountManager.all().then((res) => {
  accounts.value = res
})
</script>

<template>
  <div class="">
    <AccountItem v-for="account in accounts" :key="account.id" :account="account" :show-connect-button="true" />

    <!-- create -->
    <div
      class="group group -mx-2 flex cursor-pointer items-center justify-start gap-x-2 rounded-md px-2 py-4 transition hover:bg-blue-100"
      @click="() => $router.push('/welcome')"
    >
      <!-- icon -->
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-blue-200">
        <PlusIcon class="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
      </div>

      <div class="text-sm font-bold text-gray-700">Create new account</div>
    </div>
  </div>
</template>
