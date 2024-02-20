<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { getAddress } from '@/lib/account'
import { ref, computed, onMounted } from 'vue'
import { getAssetsDisplay } from '@/lib/assets'
import { useBRC20AssetQuery } from '@/queries/btc'
import { useMVCAssetsQuery } from '@/queries/tokens'
import { SquaresPlusIcon } from '@heroicons/vue/24/outline'
import { type Asset, BTCAsset, MVCAsset } from '@/data/assets'

import AssetItem from './AssetItem.vue'

const router = useRouter()

const mvcAddress = ref<string>('')
const btcAddress = ref<string>('')

onMounted(async () => {
  mvcAddress.value = await getAddress('mvc')
  btcAddress.value = await getAddress('btc')

  if (!btcAddress.value || !mvcAddress.value) {
    router.push('/welcome')
  }
})

const assetsDisplay = ref<string[]>([])
getAssetsDisplay().then((display) => {
  assetsDisplay.value = display
})

const { isLoading: btcAssetsLoading, data: btcAssets } = useBRC20AssetQuery(btcAddress, {
  enabled: computed(() => !!btcAddress.value),
})

const { isFetching: mvcAssetsLoading, data: mvcAssets } = useMVCAssetsQuery(mvcAddress, {
  enabled: computed(() => !!mvcAddress.value),
})

function toManageAssets() {
  router.push('/wallet/manage-assets')
}

function toNative(asset: Asset, address: string) {
  router.push({
    name: 'asset',
    params: { symbol: asset.symbol, address },
  })
}

function toToken(token: Asset, address: string) {
  router.push({
    name: 'token',
    params: { genesis: token.genesis, symbol: token.symbol, address },
    query: { genesis: token.genesis, symbol: token.symbol, address },
  })
}
</script>

<template>
  <div class="mt-8 space-y-5 text-black">
    <div class="text-base font-bold text-gray-900">BTC</div>
    <div class="space-y-2" v-if="btcAddress">
      <AssetItem :asset="BTCAsset" :address="btcAddress" @click="toNative(BTCAsset, btcAddress)" />
      <AssetItem
        :asset="asset"
        :key="asset.symbol"
        :address="btcAddress"
        v-show="!btcAssetsLoading"
        v-for="asset in btcAssets"
        @click="toNative(asset, btcAddress)"
      />
    </div>
    <div v-else class="text-center text-gray-500 text-sm">BTC Asset Loading...</div>

    <div class="text-base font-bold text-gray-900">MVC</div>
    <div class="space-y-2" v-if="mvcAddress">
      <AssetItem :asset="MVCAsset" :address="mvcAddress" @click="toNative(MVCAsset, mvcAddress)" />
      <AssetItem
        :asset="asset"
        :key="asset.genesis"
        :address="mvcAddress"
        v-show="!mvcAssetsLoading"
        v-for="asset in mvcAssets"
        @click="toToken(asset, mvcAddress)"
      />
    </div>
    <div v-else class="text-center text-gray-500 text-sm">MVC Asset Loading...</div>

    <!-- Manage Token List -->
    <!-- <div class="flex items-center justify-center pb-4">
      <button class="hover-gradient-text group flex items-center gap-x-2 text-sm text-gray-500" @click="toManageAssets">
        <SquaresPlusIcon class="h-4 w-4 group-hover:text-blue-600" />
        <span>Manage Token List</span>
      </button>
    </div> -->
  </div>
</template>
