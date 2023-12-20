<script lang="ts" setup>
import { ref } from 'vue'
import BRCTokenList from './BRCTokenList.vue'
import { useRoute, useRouter } from 'vue-router'
import BtcLogoImg from '@/assets/images/btc-logo.svg?url'
import AccountItem from '../accounts/components/Item.vue'
import SpaceLogoImg from '@/assets/images/space-logo.svg?url'
import { getCurrentAccount, type Account } from '@/lib/account'
import MvcCollectionPanel from './components/MvcCollectionPanel.vue'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

const route = useRoute()
const router = useRouter()

const account = ref<Account | null>(null)
getCurrentAccount().then((acc) => {
  account.value = acc
})

const selectedTab = ref(Number(route.params.tabIndex))

function changeTab(index: number) {
  selectedTab.value = index
  router.push({
    name: 'collections',
    params: {
      tabIndex: index,
    },
  })
}
</script>

<template>
  <!-- 账号信息 -->
  <AccountItem :account="account" :current-account="account" v-if="account" :show-network="true" class="mb-4 -mt-4" />

  <!-- 链切换标签 -->
  <TabGroup :selectedIndex="selectedTab" @change="changeTab">
    <TabList class="mx-auto flex w-5/6 rounded-md bg-gray-100">
      <Tab class="tab">
        <img :src="BtcLogoImg" />
        <span>BTC</span>
      </Tab>
      <Tab class="tab">
        <img :src="SpaceLogoImg" />
        <span>MVC</span>
      </Tab>
    </TabList>
    <TabPanels class="mt-8">
      <TabPanel>
        <BRCTokenList />
      </TabPanel>
      <TabPanel>
        <MvcCollectionPanel />
      </TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<style scoped lang="css">
.tab {
  @apply flex flex-1 items-center justify-center gap-2 rounded-inherit py-2 text-sm font-bold focus:outline-none focus:ring-0 ui-selected:bg-btn-blue ui-selected:text-blue-50;
}

.tab > img {
  @apply h-6 w-6 rounded-full bg-white p-1;
}

.tab > img:nth-child(1) {
  @apply p-0;
}
</style>
