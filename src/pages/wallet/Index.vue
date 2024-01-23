<script lang="ts" setup>
import { ref } from 'vue'
import passwordManager from '@/lib/password'
import { getCurrentAccount, type Account } from '@/lib/account'
import { useRouter } from 'vue-router'
import Balance from './components/Balance.vue'
import AssetList from './components/AssetList.vue'
import AccountItem from '../accounts/components/Item.vue'
import { getLastLockTime } from '@/lib/lock'

const router = useRouter()

// check password
passwordManager.has().then(async hasPassword => {
  if (!hasPassword) {
    router.push('/wallet/set-password')
    return
  }
  // check lock time
  const time = await getLastLockTime()
  if (time === -1 || Date.now() - time > 1000 * 60 * 60) {
    router.push('/lock')
  }
})

const currentAccount = ref<Account>()
getCurrentAccount().then((acc) => {
  if (!acc) return

  currentAccount.value = acc
})
</script>

<template>
  <div class="-mt-4">
    <!-- Account Info -->
    <AccountItem :show-network="true" v-if="currentAccount" :account="currentAccount" :current-account="currentAccount" />

    <Balance />

    <!-- Asset List -->
    <AssetList />
  </div>
</template>
