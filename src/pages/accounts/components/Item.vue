<script lang="ts" setup>
import { computed, ref } from 'vue'
import accountManager from '../../../lib/account'
import type { Account } from '../../../lib/account'
import { network } from '../../../lib/network'
import { ClipboardDocumentCheckIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  account: Account
  showConnectButton?: boolean
  showNetwork?: boolean
}>()

const isCopied = ref(false)
const copyAddress = () => {
  navigator.clipboard.writeText(address.value)
  isCopied.value = true
}

// 根据当前网络环境获取地址
const address = computed(() => {
  if (network.value === 'testnet') {
    return props.account.testnetAddress
  }
  return props.account.mainnetAddress
})

const prettifyAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

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

const connect = async () => {
  await accountManager.connect(props.account.id)

  // 返回首页
  router.push('/wallet')
}

const isCurrent = computed(() => {
  return props.account.id === accountManager.current.value?.id
})
</script>

<template>
  <div class="flex items-center justify-between border-b border-gray-100">
    <div class="flex items-center justify-start gap-x-2 py-4" :key="account.id">
      <!-- avatar -->
      <div :class="['h-12 w-12 rounded-full bg-gradient-to-br', randomColor(account.mainnetAddress)]"></div>

      <!-- info -->
      <div class="flex flex-col">
        <div class="flex gap-x-2">
          <div class="text-sm font-bold" :class="isCurrent && showConnectButton && 'text-blue-500'">
            {{ account.name }}
          </div>
          <span
            class="text-xs bg-gray-100 rounded-sm text-gray-500 px-2 py-0.5"
            v-if="showNetwork && network === 'testnet'"
            >{{ network }}</span
          >
        </div>

        <div class="flex items-center gap-x-1">
          <div class="text-sm text-gray-500">{{ prettifyAddress(address) }}</div>
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
      <button
        class="rounded-md bg-blue-100 py-1 px-2 text-sm text-blue-700 transition hover:bg-blue-200"
        @click="connect"
        v-else
      >
        Connect
      </button>
    </template>
  </div>
</template>
