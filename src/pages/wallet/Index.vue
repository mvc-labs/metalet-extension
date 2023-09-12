<script lang="ts" setup>
import Balance from './components/Balance.vue'
import AccountItem from '../accounts/components/Item.vue'
import AssetList from './components/AssetList.vue'
import { currentAccount, deriveAddress } from '@/lib/account'
import { getBTCBalance } from '@/queries/btc'

const uuu = () => {
  getBTCBalance("bc1pv3efxdwc2nkck5kg8updw62kxqt8mclshk3a2ywlazqa6n225n9qvd2v93").then(data => {
    console.log("getBTCBalance", data);
  })

  deriveAddress({ chain: "btc" }).then(data => {
    console.log("deriveAddress", data)
  })
}
</script>

<template>
  <!-- main -->
  <div class="-mt-4">
    <!-- 账号信息 -->
    <AccountItem :account="currentAccount" v-if="currentAccount" :show-network="true" />

    <Balance />

    <!-- 资产列表 -->
    <AssetList />

    <button @click="uuu">getBTCBalance</button>
  </div>
</template>
