<script lang="ts" setup>
import { ref } from 'vue'
import { createEmit } from '@/lib/emitters'
import { type Account } from '@/lib/account'
import Balance from './components/Balance.vue'
import AssetList from './components/AssetList.vue'
import AccountItem from '../accounts/components/Item.vue'

const currentAccount = ref<Account | null>(null)
createEmit<Account>('getCurrentAccount')().then((acc) => {
  currentAccount.value = acc
})
</script>

<template>
  <div class="-mt-4">
    <!-- Account Info -->
    <AccountItem :account="currentAccount" v-if="currentAccount" :show-network="true" />

    <Balance />

    <!-- Asset List -->
    <AssetList />
  </div>
</template>
