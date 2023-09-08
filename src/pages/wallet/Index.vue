<script lang="ts" setup>
import Balance from './components/Balance.vue'
import AccountItem from '../accounts/components/Item.vue'
import AssetList from './components/AssetList.vue'
import { account } from '@/lib/account'
</script>

<template>
  <!-- main -->
  <div class="-mt-4">
    <!-- 账号信息 -->
    <AccountItem :account="account" v-if="account" :show-network="true" />

    <Balance />

    <!-- 资产列表 -->
    <AssetList />
  </div>
</template>
