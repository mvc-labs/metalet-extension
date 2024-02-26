<script lang="ts" setup>
import { ref } from 'vue'
import Balance from './components/Balance.vue'
import AssetList from './components/AssetList.vue'
import { process } from '@/lib/actions/btc/inscribe'
import AccountItem from '../accounts/components/Item.vue'
import { getCurrentAccount, type Account } from '@/lib/account'

const currentAccount = ref<Account>()
getCurrentAccount().then((acc) => {
  if (!acc) return

  currentAccount.value = acc
})

const test = async () => {
  // const res = await process({
  //   data: {
  //     commitFeeRate: 1,
  //     revealFeeRate: 1,
  //     metaidDataList: [],
  //     revealOutValue: 546,
  //     changeAddress: 'tb1pv3efxdwc2nkck5kg8updw62kxqt8mclshk3a2ywlazqa6n225n9qm9url7',
  //   },
  //   options: { noBroadcast: false },
  // })
  // console.log({ res })
}
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

    <button @click="test">test</button>

    <Balance />

    <!-- Asset List -->
    <AssetList />
  </div>
</template>
