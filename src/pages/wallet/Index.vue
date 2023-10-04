<script lang="ts" setup>
import { ref } from 'vue'

import Balance from './components/Balance.vue'
import AccountItem from '../accounts/components/Item.vue'
import AssetList from './components/AssetList.vue'
import { type Account, getCurrentAccount } from '@/lib/account'

const currentAccount = ref<Account | null>(null)
getCurrentAccount().then((acc) => {
  currentAccount.value = acc
})
</script>

<template>
  <!-- main -->
  <div class="-mt-4">
    <!-- 账号信息 -->
    <AccountItem :account="currentAccount" v-if="currentAccount" :show-network="true" />

    <Balance />

    <!-- 资产列表 -->
    <AssetList />
  </div>
</template>
