<script lang="ts" setup>
import { computed, ref } from 'vue'
import { type Asset } from '@/data/assets'
import { isOfficialToken } from '@/lib/assets'
import { useRoute, useRouter } from 'vue-router'
import { useMVCTokenQuery } from '@/queries/tokens'
import Activities from './components/Activities.vue'
import { prettifyTokenBalance, prettifyTokenGenesis } from '@/lib/formatters'
import {
  CheckBadgeIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()

const symbol = route.params.symbol as string
const address = route.params.address as string
const genesis = route.params.genesis as string
const enabled = computed(() => !!address && !!symbol && !!genesis)

// 用户拥有的代币资产
const { isLoading, data: token } = useMVCTokenQuery(ref(address), genesis, { enabled })
const asset = computed(() => {
  if (token.value) {
    console.log('token', token.value)

    return {
      symbol: token.value.symbol,
      tokenName: token.value.name,
      isNative: false,
      chain: 'mvc',
      queryable: true,
      decimal: token.value.decimal,
      contract: 'MetaContract',
      codeHash: token.value.codeHash,
      genesis: token.value.genesis,
    } as Asset
  }
})

const toSend = () => {
  router.push({
    name: 'send-token',
    params: { symbol, genesis },
  })
}
const toReceive = () => {
  router.push(`/wallet/receive?chain=mvc`)
}

const isCopied = ref(false)
const copyGenesis = () => {
  navigator.clipboard.writeText(token.value!.genesis)
  isCopied.value = true
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center">
    <!-- <img :src="token.logo" alt="" class="h-20 w-20 rounded-xl" v-if="token && token.logo" /> -->

    <CircleStackIcon class="h-20 w-20 text-gray-300" />

    <div v-if="isLoading" class="mt-4">--</div>
    <div v-else-if="token" class="mt-4 flex flex-col items-center self-stretch">
      <div class="mb-1 text-center text-xl">
        {{ prettifyTokenBalance(token.confirmed + token.unconfirmed, token.decimal) + ' ' + token.symbol }}
      </div>

      <!-- Contract ID -->
      <div class="mt-8 self-stretch">
        <div class="text-xs text-gray-500">Token Contract ID</div>
        <div class="flex items-center">
          <CheckBadgeIcon class="mr-1 h-5 w-5 text-blue-500" v-if="token && isOfficialToken(token.genesis)" />
          <div class="text-base text-gray-900">{{ prettifyTokenGenesis(token.genesis) }}</div>

          <ClipboardDocumentCheckIcon class="ml-2 h-4 w-4 text-blue-500" v-if="isCopied" />
          <button class="ml-2 text-gray-400 hover:text-gray-500" @click.stop="copyGenesis" type="button" v-else>
            <ClipboardDocumentListIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- buttons -->
      <div class="mt-4 grid grid-cols-2 gap-x-3 self-stretch">
        <button class="secondary-btn col-span-1 py-3" @click="toSend">SEND</button>
        <button class="secondary-btn col-span-1 py-3" @click="toReceive">RECEIVE</button>
      </div>

      <Activities class="mt-8 self-stretch" v-if="asset" :asset="asset" :address="address" />
    </div>
  </div>
</template>
