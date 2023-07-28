<script lang="ts" setup>
import { ref, computed, Ref } from 'vue'
import { useRouter } from 'vue-router'
import { SquaresPlusIcon } from '@heroicons/vue/24/outline'

import assetsList from '@/data/assets'
import type { Asset } from '@/data/assets'
import AssetItem from './AssetItem.vue'
import { getAssetsDisplay } from '@/lib/assets'
import useTokensQuery from '@/queries/tokens'
import { getAddress } from '@/lib/account'

const router = useRouter()

const address: Ref<string> = ref('')
getAddress().then((add) => {
  if (!add) return router.push('/welcome')

  address.value = add
})
const enabled = computed(() => !!address.value)

const listedAssets = ref(assetsList)

// 用户拥有的代币资产
const { isLoading, data: userOwnedTokens } = useTokensQuery(address, { enabled })
type UserOwnedToken = NonNullable<typeof userOwnedTokens.value>[number]

const assetsDisplay: Ref<string[]> = ref([])
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
  <div class="mt-8 space-y-2 text-black">
    <!-- Add More -->
    <div class="flex items-center justify-end">
      <button class="hover-gradient-text group flex items-center gap-x-2 text-sm" @click="toManageAssets">
        <SquaresPlusIcon class="h-4 w-4 group-hover:text-blue-600" />
        <span>Manage Token List</span>
      </button>
    </div>

    <AssetItem v-for="asset in displayingAssets" :key="asset.symbol" :asset="asset" @click="toNative(asset)" />

    <AssetItem v-for="token in userOwnedTokens" :key="token.genesis" :asset="token" @click="toToken(token)" />

    <!-- 拥有的FT资产 -->
  </div>
</template>
