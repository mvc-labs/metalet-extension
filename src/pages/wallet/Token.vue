<script lang="ts" setup>
import { computed, ref } from 'vue'
import { getFTLogo } from '@/data/logos'
import { type Asset } from '@/data/assets'
import { isOfficialToken } from '@/lib/assets'
import { useRoute, useRouter } from 'vue-router'
import { useMVCTokenQuery } from '@/queries/tokens'
import Activities from './components/Activities.vue'
import { prettifyTokenBalance, prettifyTokenGenesis } from '@/lib/formatters'
import { CheckBadgeIcon, ClipboardDocumentCheckIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()

const symbol = route.params.symbol as string
const address = route.params.address as string
const genesis = route.params.genesis as string
const enabled = computed(() => !!address && !!symbol && !!genesis)

const { isLoading, data: token } = useMVCTokenQuery(ref(address), genesis, { enabled })
const asset = computed(() => {
  if (token.value) {
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
      logo: getFTLogo(token.value.name),
      balance: {
        total: token.value.confirmed + token.value.unconfirmed,
        confirmed: token.value.confirmed,
        unconfirmed: token.value.unconfirmed,
      },
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
    <div v-if="isLoading" class="text-center text-gray-500 font-bold">Token Asset Loading...</div>

    <template v-else-if="!!asset && !!token">
      <!-- logo -->
      <img v-if="asset?.logo" :src="asset.logo" alt="" class="h-20 w-20 rounded-full" />
      <div v-else style="line-height: 80px" class="h-20 w-20 text-center rounded-full text-white text-3xl bg-[#1E2BFF]">
        {{ symbol[0].toLocaleUpperCase() }}
      </div>

      <!-- token info -->
      <div class="mt-4 flex flex-col items-center self-stretch">
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
    </template>

    <div v-else class="text-center text-gray-500 font-bold">No Token Asset.</div>
  </div>
</template>
