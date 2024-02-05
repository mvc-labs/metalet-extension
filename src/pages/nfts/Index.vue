<script lang="ts" setup>
import { ref } from 'vue'
import BRCTokenList from './BRCTokenList.vue'
import MetaIDPinList from './MetaIDPinList.vue'
import { useRoute, useRouter } from 'vue-router'
import BtcLogoImg from '@/assets/images/btc-logo.svg?url'
import AccountItem from '../accounts/components/Item.vue'
import SpaceLogoImg from '@/assets/images/space-logo.svg?url'
import { getCurrentAccount, type Account } from '@/lib/account'
import MvcCollectionPanel from './components/MvcCollectionPanel.vue'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

import { Squares2X2Icon } from '@heroicons/vue/24/outline'
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/solid'


const nfts = [
  { id: 1, name: 'Ordinals', disabled: false },
  { id: 2, name: 'Atomicals', disabled: true },
  { id: 3, name: 'MetaContract', disabled: false },
  { id: 4, name: 'MetaID Pin', disabled: false },
]
const selectedNFT = ref(nfts[0])

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

  <div class="relative">
    <div :class="['absolute right-0 z-10', selectedTab === 1 ? '' : 'hidden']">
      <Listbox v-model="selectedNFT">
        <ListboxButton class="flex items-center gap-x-1.5 border-2 rounded-xl py-1.5 px-[18px] ml-auto">
          <Squares2X2Icon class="w-5 h-5" />
          <span>{{ selectedNFT.name }}</span>
          <ChevronDownIcon class="w-3 h-3" />
        </ListboxButton>
        <ListboxOptions class="p-[18px] bg-white rounded-xl select-box-shadow space-y-5 w-[184px]">
          <ListboxOption v-for="nft in nfts" :key="nft.id" :value="nft"
            :class="[!nft.disabled ? 'cursor-pointer' : 'cursor-not-allowed', 'flex items-center']"
            :disabled="nft.disabled">
            <span>{{ nft.name }}</span>
            <div
              :class="['w-5 h-5 flex items-center justify-center bg-[#1E2BFF] rounded ml-auto', selectedNFT.id !== nft.id ? 'hidden' : '']">
              <CheckIcon class="text-white w-2.5" />
            </div>
          </ListboxOption>
        </ListboxOptions>
      </Listbox>
    </div>

    <TabGroup :selectedIndex="selectedTab" @change="changeTab">
      <TabList>
        <Tab :class="['tab1', selectedTab === 0 ? 'active' : '']">
          <span>Crypto</span>
        </Tab>
        <Tab :class="['tab1', selectedTab === 1 ? 'active' : '']">
          <span>NFTs</span>
        </Tab>
      </TabList>
      <TabPanels class="mt-8">
        <TabPanel>
          <div class="text-[#909399] mt-[58px] text-center">No collectibles yet</div>
        </TabPanel>
        <TabPanel>
          <MvcCollectionPanel v-if="selectedNFT.name === 'MetaContract'" />
          <BRCTokenList v-else-if="selectedNFT.name === 'Ordinals'" />
          <MetaIDPinList v-else-if="selectedNFT.name === 'MetaID Pin'" />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>

  <!-- 链切换标签 -->
  <!-- <TabGroup :selectedIndex="selectedTab" @change="changeTab">
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
  </TabGroup> -->
</template>

<style scoped lang="css">
.tab {
  @apply flex flex-1 items-center justify-center gap-2 rounded-inherit py-2 text-sm font-bold focus:outline-none focus:ring-0 ui-selected:bg-btn-blue ui-selected:text-blue-50;
}

.tab>img {
  @apply h-6 w-6 rounded-full bg-white p-1;
}

.tab>img:nth-child(1) {
  @apply p-0;
}

.tab1 {
  padding: 10px 8px;
}

.tab1>span {
  color: #999999;
  font-weight: bold;
}

.tab1.active>span {
  color: #1E2BFF;
}

.tab1.active {
  border-bottom: 2px solid #1E2BFF;
}

.select-box-shadow {
  box-shadow: 0px 0px 6px 0px rgba(48, 49, 51, 0.15);
}
</style>
