<script lang="ts" setup>
import Balance from './components/Balance.vue'
import AccountItem from '../accounts/components/Item.vue'
import AssetList from './components/AssetList.vue'
import { currentAccount, deriveAddress } from '@/lib/account'
import { getBTCBalance } from '@/queries/btc'
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
