<script lang="ts" setup>
import { ref } from 'vue'
import Balance from './components/Balance.vue'
import AccountHeader from './AccountHeader.vue'
import AssetTabs from './components/AssetTabs.vue'
import { getCurrentAccount, type Account } from '@/lib/account'

const currentAccount = ref<Account>()
getCurrentAccount().then((acc) => {
  if (!acc) return

  currentAccount.value = acc
})
</script>

<template>
  <div class="nicer-scrollbar pt-3 space-y-6">
    <AccountHeader v-if="currentAccount" :account="currentAccount" />

    <Balance />

    <AssetTabs />
  </div>
</template>
