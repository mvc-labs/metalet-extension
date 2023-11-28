<script lang="ts" setup>
import { ref } from 'vue'

import { getCurrentAccount, type Account } from '@/lib/account'

import Balance from './components/Balance.vue'
import AssetList from './components/AssetList.vue'
import AccountItem from '../accounts/components/Item.vue'

const currentAccount = ref<Account | null>()
getCurrentAccount().then((acc) => {
  currentAccount.value = acc
})
</script>

<template>
  <div class="-mt-4">
    <!-- Account Info -->
    <AccountItem
      :account="currentAccount"
      :currentAccount="currentAccount"
      v-if="currentAccount"
      :show-network="true"
    />

    <Balance />

    <!-- Asset List -->
    <AssetList />
  </div>
</template>
