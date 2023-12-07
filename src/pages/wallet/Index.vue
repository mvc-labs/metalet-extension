<script lang="ts" setup>
import { ref } from 'vue'
import { createEmit } from '@/lib/emitters'
import { type Account } from '@/lib/account'
import Balance from './components/Balance.vue'
import AssetList from './components/AssetList.vue'
import AccountItem from '../accounts/components/Item.vue'

const currentAccount = ref<Account | undefined>()
createEmit<Account>('getCurrentAccount')().then(async (acc) => {
  currentAccount.value = acc
})
</script>

<template>
  <div class="-mt-4">
    <!-- Account Info -->
    <AccountItem
      :show-network="true"
      v-if="currentAccount"
      :account="currentAccount"
      :currentAccount="currentAccount"
    />

    <Balance />

    <!-- Asset List -->
    <AssetList />
  </div>
</template>
