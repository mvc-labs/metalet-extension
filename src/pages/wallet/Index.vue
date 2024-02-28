<script lang="ts" setup>
import { ref } from 'vue'
import Balance from './components/Balance.vue'
import AccountHeader from './AccountHeader.vue'
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
  <div class="nicer-scrollbar pt-3 space-y-6">
    <AccountHeader v-if="currentAccount" :account="currentAccount"/>

    <Balance />

    <AssetList />
  </div>
</template>
