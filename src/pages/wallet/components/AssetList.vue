<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SquaresPlusIcon } from '@heroicons/vue/24/outline'

import AssetItem from './AssetItem.vue'
import { getAddress } from '@/lib/account'
import type { Asset } from '@/data/assets'
import useTokensQuery from '@/queries/tokens'
import { getAssetsDisplay } from '@/lib/assets'
import { BTCAssets, MVCAssets } from '@/data/assets'

const router = useRouter()

const address = ref<string>('')
getAddress().then((add) => {
  if (!add) return router.push('/welcome')

  address.value = add
})
const enabled = computed(() => !!address.value)

const btcAssets = ref(BTCAssets)
const listedAssets = ref(MVCAssets)

const { isLoading, data: userOwnedTokens } = useTokensQuery(address, { enabled })
type UserOwnedToken = NonNullable<typeof userOwnedTokens.value>[number]

const assetsDisplay = ref<string[]>([])
getAssetsDisplay().then((display) => {
  assetsDisplay.value = display
})
const displayingAssets = computed(() => {
  return listedAssets.value.filter((asset) => assetsDisplay.value.includes(asset.symbol))
})

function toManageAssets() {
  router.push('/wallet/manage-assets')
}

function toNative(asset: Asset) {
  router.push({
    name: 'asset',
    params: { symbol: asset.symbol },
  })
}

function toToken(token: UserOwnedToken) {
  router.push({
    name: 'token',
    params: { genesis: token.genesis, symbol: token.symbol },
  })
}
</script>

<template>
  <div class="mt-8 space-y-5 text-black">
    <div class="space-y-2">
      <div class="text-base font-bold text-gray-900">BTC</div>
      <AssetItem v-for="asset in btcAssets" :key="asset.symbol" :asset="asset" @click="toNative(asset)" />
    </div>

    <div class="space-y-2">
      <div class="text-base font-bold text-gray-900">MVC</div>
      <AssetItem v-for="asset in displayingAssets" :key="asset.symbol" :asset="asset" @click="toNative(asset)" />
      <AssetItem v-for="token in userOwnedTokens" :key="token.genesis" :asset="token" @click="toToken(token)" />
    </div>

    <!-- Manage Token List -->
    <div class="flex items-center justify-center pb-4">
      <button class="hover-gradient-text group flex items-center gap-x-2 text-sm text-gray-500" @click="toManageAssets">
        <SquaresPlusIcon class="h-4 w-4 group-hover:text-blue-600" />
        <span>Manage Token List</span>
      </button>
    </div>
  </div>
</template>
