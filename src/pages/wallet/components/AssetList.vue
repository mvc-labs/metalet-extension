<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SquaresPlusIcon } from '@heroicons/vue/24/outline'

import { getAddress } from '@/lib/account'
import { getAssetsDisplay } from '@/lib/assets'
import useTokensQuery from '@/queries/tokens'
import { useBTCAseetQuery } from '@/queries/btc'
import { type Asset, BTCAssets, MVCAssets } from '@/data/assets'

import AssetItem from './AssetItem.vue'

const router = useRouter()

const mvcAddress = ref<string>('')
const btcAddress = ref<string>('')
const btcAssets = ref<Asset[]>(BTCAssets.filter((asset) => asset.symbol === 'BTC') || [])

onMounted(async () => {
  mvcAddress.value = await getAddress('mvc')
  btcAddress.value = await getAddress('btc')

  if (!btcAddress.value || !mvcAddress.value) {
    toWelcome()
  }
})

// FTXME fetchBTCAsset loop request
const enabledBTCAseetQuery = computed(() => !!btcAddress.value)
// if(enabledBTCAseetQuery)
const { data: userBRC20Asset } = useBTCAseetQuery(btcAddress, { enabled: enabledBTCAseetQuery })
btcAssets.value = BTCAssets.filter((asset) => asset.symbol === 'BTC' || userBRC20Asset.value?.includes(asset.symbol))

const listedAssets = ref(MVCAssets)

const { isLoading, data: userOwnedTokens } = useTokensQuery(mvcAddress, { enabled: computed(() => !!mvcAddress.value) })
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

function toWelcome() {
  router.push('/welcome')
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
