<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, PencilSquareIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'

import accountManager, { deriveAddress, type Account, updateBTCType, currentAccount, getAddress } from '@/lib/account'
import { network } from '@/lib/network'
import { shortestAddress } from '@/lib/formatters'

import EditName from './EditName.vue'

const router = useRouter()

const props = defineProps<{
  account: Account
  showConnectButton?: boolean
  showNetwork?: boolean
}>()

console.log("network", network.value);
console.log("currentAccount", currentAccount.value);
console.log("props.account", props.account.id);

const mvcAddress = ref('')
deriveAddress({ chain: 'mvc' }).then((address = "") => (mvcAddress.value = address))
const btcAddress = ref('')
deriveAddress({ chain: 'btc' }).then((address = "") => (btcAddress.value = address))

const isCopied = ref(false)
const copyAddress = () => {
  navigator.clipboard.writeText(address.value)
  isCopied.value = true
}

console.log("test", 11111);


// 根据当前网络环境获取地址
const address = computed(() => {
  if (network.value === 'testnet') {
    return props.account.testnet.mvc.address
  }
  return props.account.mainnet.mvc.address
})

console.log("test", 222222);

const randomColor = (key: string) => {
  const colors = [
    'from-blue-100 to-blue-500',
    'from-green-100 to-green-500',
    'from-yellow-100 to-yellow-500',
    'from-red-100 to-red-500',
    'from-pink-100 to-pink-500',
    'from-purple-100 to-purple-500',
    'from-indigo-100 to-indigo-500',
  ]
  // 根据key的hash值取模，得到colors数组的下标
  const index = Math.abs(key.split('').reduce((prev, curr) => prev + curr.charCodeAt(0), 0)) % colors.length

  return colors[index]
}


console.log("test", 333333);

const connect = async () => {
  await accountManager.connect(props.account.id)

  // 返回首页
  router.push('/wallet')
}


console.log("test", 44444);

const isCurrent = computed(() => {
  return props.account.id === accountManager.current.value?.id
})

console.log("test", 555555);

const openEditNameModal = ref(false)
</script>

<template>
  <div class="flex items-center justify-between border-b border-gray-100">
    <!-- edit name modal -->
    <EditName v-model:open="openEditNameModal" :account="props.account" />

    <div class="flex items-center justify-start gap-x-2 py-4" :key="account.id">
      <!-- avatar -->
      <div :class="['h-12 w-12 rounded-full bg-gradient-to-br', randomColor(account.mainnet.mvc.address)]"></div>

      <!-- info -->
      <div class="group flex flex-col">
        <div class="flex items-center gap-x-2">
          <div class="text-sm font-bold" :class="isCurrent && showConnectButton && 'text-blue-500'">
            {{ account.name }}
          </div>

          <PencilSquareIcon class="hidden h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-500 group-hover:inline"
            @click="openEditNameModal = true" v-if="!showConnectButton" />

          <span class="rounded-sm bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
            v-if="showNetwork && network === 'testnet'">{{ network }}</span>
        </div>

        <div class="mt-1 flex items-center gap-x-1">
          <div class="flex items-center gap-2">
            <div class="text-xs text-gray-400">MVC Address</div>
            <div class="text-sm text-gray-500">{{ shortestAddress(mvcAddress) }}</div>
          </div>

          <ClipboardDocumentCheckIcon class="h-4 w-4 text-blue-500" v-if="isCopied" />
          <button class="text-gray-400 hover:text-gray-500" @click.stop="copyAddress" type="button" v-else>
            <ClipboardDocumentListIcon class="h-4 w-4" />
          </button>
        </div>

        <div class="flex items-center gap-x-1">
          <div class="flex items-center gap-2">
            <div class="text-xs text-gray-400">BTC Address</div>
            <div class="text-sm text-gray-500">{{ shortestAddress(btcAddress) }}</div>
          </div>

          <ClipboardDocumentCheckIcon class="h-4 w-4 text-blue-500" v-if="isCopied" />
          <button class="text-gray-400 hover:text-gray-500" @click.stop="copyAddress" type="button" v-else>
            <ClipboardDocumentListIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- connect button -->
    <template v-if="showConnectButton">
      <span v-if="isCurrent" class="text-sm text-gray-500">active</span>
      <button class="rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-700 transition hover:bg-blue-200" @click="connect"
        v-else>
        Connect
      </button>
    </template>
  </div>
</template>
