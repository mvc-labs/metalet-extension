<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SquaresPlusIcon } from '@heroicons/vue/24/outline'

import { BTCAssets, MVCAssets } from '@/data/assets'
import type { Asset } from '@/data/assets'
import AssetItem from './AssetItem.vue'
import { getAssetsDisplay } from '@/lib/assets'
import useTokensQuery from '@/queries/tokens'
import { getAddress } from '@/lib/account'

const router = useRouter()

const address = ref<string>('')
getAddress().then((add) => {
  if (!add) return router.push('/welcome')

  address.value = add
})
const enabled = computed(() => !!address.value)

const btcAssets = ref(BTCAssets)
const listedAssets = ref(MVCAssets)

// 用户拥有的代币资产
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
  <div class="mt-4 space-y-5 text-black">
    <!-- Add More -->
    <div class="flex items-center justify-end">
      <button class="hover-gradient-text group flex items-center gap-x-2 text-sm" @click="toManageAssets">
        <SquaresPlusIcon class="h-4 w-4 group-hover:text-blue-600" />
        <span>Manage Token List</span>
      </button>
    </div>

    <div>
      <div class="ext-lg text-[#141416]">BTC</div>
      <AssetItem v-for="asset in btcAssets" :key="asset.symbol" :asset="asset" @click="toNative(asset)" class="mt-1.5" />
    </div>

    <div>
      <div class="text-lg text-[#141416]">MVC</div>
      <AssetItem v-for="asset in displayingAssets" :key="asset.symbol" :asset="asset" @click="toNative(asset)"
        class="mt-1.5" />
    </div>

    <AssetItem v-for="token in userOwnedTokens" :key="token.genesis" :asset="token" @click="toToken(token)" />

    <!-- 拥有的FT资产 -->
  </div>
</template>
