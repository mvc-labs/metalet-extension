<script lang="ts" setup>
import { ref, toRaw } from 'vue'
import { PlusIcon } from '@heroicons/vue/20/solid'

import { type Account, getAccounts, getCurrentAccount } from '@/lib/account'

import AccountItem from './components/Item.vue'

const accounts = ref<Account[] | undefined>()
getAccounts().then((res) => {
  accounts.value = Array.from(toRaw(res), ([key, value]) => value)
})

const currentAccount = ref<Account>()
getCurrentAccount().then((acc) => {
  if (!acc) return

  currentAccount.value = acc
})
</script>

<template>
  <div class="">
    <AccountItem
      v-for="account in accounts"
      :key="account.id"
      :account="account"
      :current-account="currentAccount"
      :show-connect-button="true"
    />

    <!-- create -->
    <div
      class="group group -mx-2 flex cursor-pointer items-center justify-start gap-x-2 rounded-md px-2 py-4 transition hover:bg-blue-100"
      @click="() => $router.push('/welcome')"
    >
      <!-- icon -->
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-blue-200">
        <PlusIcon class="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
      </div>

      <div class="text-sm  text-gray-700">Create new account</div>
    </div>
  </div>
</template>
