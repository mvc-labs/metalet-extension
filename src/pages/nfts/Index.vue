<script lang="ts" setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { ref } from 'vue'

import SpaceLogoImg from '@/assets/images/space-logo.svg?url'
import BtcLogoImg from '@/assets/images/btc-logo.svg?url'
import MvcCollectionPanel from './components/MvcCollectionPanel.vue'
import BtcCollectionPanel from './components/BtcCollectionPanel.vue'
import AccountItem from '../accounts/components/Item.vue'
import { type Account, getCurrentAccount } from '@/lib/account'

const account = ref<Account | null>(null)
getCurrentAccount().then((acc) => {
  account.value = acc
})
</script>

<template>
  <!-- 账号信息 -->
  <AccountItem :account="account" v-if="account" :show-network="true" class="mb-4" />

  <MvcCollectionPanel />

  <!-- 链切换标签 -->
  <!-- <TabGroup>
    <TabList class="mx-auto flex w-5/6 rounded-md bg-gray-100">
      <Tab class="tab">
        <img :src="SpaceLogoImg" class="h-6 w-6" />
        <span>MVC</span>
      </Tab>
      <Tab class="tab" disabled>
        <img :src="BtcLogoImg" />
        <span>BTC</span>
      </Tab>
    </TabList>
    <TabPanels class="mt-8">
      <TabPanel>
        <MvcCollectionPanel />
      </TabPanel>
      <TabPanel>
        <BtcCollectionPanel />
      </TabPanel>
    </TabPanels>
  </TabGroup> -->
</template>

<style scoped lang="scss">
.tab {
  @apply flex flex-1 items-center justify-center gap-2 rounded-inherit py-2 text-sm font-bold focus:outline-none focus:ring-0 ui-selected:bg-btn-blue ui-selected:text-blue-50;

  & img {
    @apply h-6 w-6 rounded-full bg-white p-1;
  }
}
</style>
