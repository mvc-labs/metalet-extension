<script lang="ts" setup>
import { ref } from 'vue'
import Balance from './components/Balance.vue'
import AssetList from './components/AssetList.vue'
import AccountItem from '../accounts/components/Item.vue'
import { type Account } from '@/lib/account'
import { getCurrentAccount } from '@/lib/emitters'

const currentAccount = ref<Account | null>(null)
getCurrentAccount().then((acc) => {
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
