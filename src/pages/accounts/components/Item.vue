<script lang="ts" setup>
import { Ref, computed, inject, ref } from 'vue'
import { ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, PencilSquareIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'
import { API_NET, API_TARGET, Wallet } from 'meta-contract'
import { useQueryClient } from '@tanstack/vue-query'

import { type Account, connectAccount, getPrivateKey } from '@/lib/account'
import { getNetwork, network } from '@/lib/network'
import { shortestAddress } from '@/lib/formatters'
import { FEEB } from '@/data/config'

import EditName from './EditName.vue'
import { assetList } from '@/lib/balance'

const router = useRouter()

const props = defineProps<{
  account: Account
  currentAccount?: Account
  showNetwork?: boolean
  showConnectButton?: boolean
}>()

const mvcAddress = ref(
  network.value === 'mainnet' ? props.account.mvc.mainnetAddress : props.account.mvc.testnetAddress
)
const btcAddress = ref(
  network.value === 'mainnet' ? props.account.btc.mainnetAddress : props.account.btc.testnetAddress
)

const isBTCCopied = ref(false)
const isMVCCopied = ref(false)

const copyBTCAddress = () => {
  navigator.clipboard.writeText(btcAddress.value)
  isBTCCopied.value = true
}

const copyMVCAddress = () => {
  navigator.clipboard.writeText(mvcAddress.value)
  isMVCCopied.value = true
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

const queryClient = useQueryClient()
const wallet = inject<Ref<Wallet>>('wallet')!
const connect = async () => {
  await connectAccount(props.account.id)

  // invalidate all queries
  await queryClient.invalidateQueries()

  // reset Asset List
  // resetAssetList()

  // update injected wallet
  const network = await getNetwork()
  const wif = await getPrivateKey()
  wallet.value = new Wallet(wif, network as API_NET, FEEB, API_TARGET.MVC)

  assetList.value = []

  router.push('/wallet')
}

const isCurrent = computed(() => {
  if (!props.currentAccount) return false

  return props.account.id === props.currentAccount.id
})

const openEditNameModal = ref(false)
</script>

<template>
  <div class="flex items-center justify-between border-b border-gray-100">
    <!-- edit name modal -->
    <EditName v-model:open="openEditNameModal" :account="props.account" />

    <div class="flex items-center justify-start gap-x-2 py-4" :key="props.account.id">
      <!-- avatar -->
      <div :class="['h-12 w-12 rounded-full bg-gradient-to-br', randomColor(props.account.mvc.mainnetAddress)]"></div>

      <!-- info -->
      <div class="group flex flex-col">
        <div class="flex items-center gap-x-2">
          <div class="text-sm " :class="isCurrent && showConnectButton && 'text-blue-500'">
            {{ account.name }}
          </div>

          <PencilSquareIcon
            class="hidden h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-500 group-hover:inline"
            @click="openEditNameModal = true"
            v-if="!showConnectButton"
          />

          <span
            class="rounded-sm bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
            v-if="showNetwork && network === 'testnet'"
            >{{ network }}</span
          >
        </div>

        <div class="mt-1 flex items-center gap-x-1">
          <div class="flex items-center gap-2">
            <div class="text-xs text-gray-400">MVC Address</div>
            <div class="text-sm text-gray-500">{{ shortestAddress(mvcAddress) }}</div>
          </div>

          <ClipboardDocumentCheckIcon class="h-4 w-4 text-blue-500" v-if="isMVCCopied" />
          <button class="text-gray-400 hover:text-gray-500" @click.stop="copyMVCAddress" type="button" v-else>
            <ClipboardDocumentListIcon class="h-4 w-4" />
          </button>
        </div>

        <div class="flex items-center gap-x-1">
          <div class="flex items-center gap-2">
            <div class="text-xs text-gray-400">BTC Address</div>
            <div class="text-sm text-gray-500">{{ shortestAddress(btcAddress) }}</div>
          </div>

          <ClipboardDocumentCheckIcon class="h-4 w-4 text-blue-500" v-if="isBTCCopied" />
          <button class="text-gray-400 hover:text-gray-500" @click.stop="copyBTCAddress" type="button" v-else>
            <ClipboardDocumentListIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- connect button -->
    <template v-if="showConnectButton">
      <span v-if="isCurrent" class="text-sm text-gray-500 cursor-pointer" @click="connect">active</span>
      <button
        class="rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-700 transition hover:bg-blue-200"
        @click="connect"
        v-else
      >
        Connect
      </button>
    </template>
  </div>
</template>
