<script lang="ts" setup>
import { ref } from 'vue'
import Balance from './components/Balance.vue'
import AssetList from './components/AssetList.vue'
import AccountItem from '../accounts/components/Item.vue'
import { getCurrentAccount, type Account } from '@/lib/account'

const currentAccount = ref<Account>()
getCurrentAccount().then((acc) => {
  if (!acc) return

  currentAccount.value = acc
})
</script>

<template>
  <div class="-mt-4 nicer-scrollbar">
    <!-- Account Info -->
    <AccountItem
      :show-network="true"
      v-if="currentAccount"
      :account="currentAccount"
      :current-account="currentAccount"
    />

    <button>test</button>

    <Balance />

    <!-- Asset List -->
    <AssetList />
  </div>
</template>
