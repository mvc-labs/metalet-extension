<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SquaresPlusIcon } from '@heroicons/vue/24/outline'

import { createEmit } from '@/lib/emitters'
import useTokensQuery from '@/queries/tokens'
import { useBTCAssetQuery } from '@/queries/btc'
import { type Asset, BTCAssets, MVCAssets } from '@/data/assets'

import AssetItem from './AssetItem.vue'

const router = useRouter()

const mvcAddress = ref<string>('')
const btcAddress = ref<string>('')

createEmit<string>('getAddress')('mvc').then((addr) => {
  mvcAddress.value = addr
})
createEmit<string>('getAddress')('btc').then((addr) => {
  btcAddress.value = addr
})

const { data: userBRC20Asset } = useBTCAssetQuery(btcAddress, { enabled: computed(() => !!btcAddress.value) })
const btcAssets = computed(() => {
  return BTCAssets.filter(
    (asset) => asset.symbol === 'BTC' || (userBRC20Asset.value && userBRC20Asset.value.includes(asset.symbol))
  )
})

const assetsDisplay = ref<string[]>([])
createEmit<string[]>('getAssetsDisplay')().then((display) => {
  assetsDisplay.value = display
})

const { data: userOwnedTokens } = useTokensQuery(mvcAddress, { enabled: computed(() => !!mvcAddress.value) })
const displayingAssets = computed(() => {
  return MVCAssets.filter((asset) => assetsDisplay.value.includes(asset.symbol))
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

type UserOwnedToken = NonNullable<typeof userOwnedTokens.value>[number]

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
      <AssetItem
        v-if="btcAddress"
        v-for="asset in btcAssets"
        :key="asset.symbol"
        :asset="asset"
        :address="btcAddress"
        @click="toNative(asset)"
      />
    </div>

    <div class="space-y-2">
      <div class="text-base font-bold text-gray-900">MVC</div>
      <AssetItem
        v-if="mvcAddress"
        v-for="asset in displayingAssets"
        :key="asset.symbol"
        :asset="asset"
        :address="mvcAddress"
        @click="toNative(asset)"
      />
      <AssetItem
        v-if="mvcAddress"
        v-for="token in userOwnedTokens"
        :key="token.genesis"
        :asset="token"
        :address="mvcAddress"
        @click="toToken(token)"
      />
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
