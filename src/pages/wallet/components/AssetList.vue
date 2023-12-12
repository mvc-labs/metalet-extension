<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AssetItem from './AssetItem.vue'
import { createEmit } from '@/lib/emitters'
import { useBTCAssetQuery } from '@/queries/btc'
import { useMVCAssetsQuery } from '@/queries/tokens'
import { SquaresPlusIcon } from '@heroicons/vue/24/outline'
import { type Asset, MVCAsset, BTCAsset } from '@/data/assets'

const router = useRouter()

const mvcAddress = ref<string>('')
const btcAddress = ref<string>('')

createEmit<string>('getAddress')('mvc').then((addr) => {
  mvcAddress.value = addr
})

createEmit<string>('getAddress')('btc').then((addr) => {
  btcAddress.value = addr
})

// TODO asset display
const assetsDisplay = ref<string[]>([])
createEmit<string[]>('getAssetsDisplay')().then((display) => {
  assetsDisplay.value = display
})

const { data: btcAssets } = useBTCAssetQuery(btcAddress, { enabled: computed(() => !!btcAddress.value) })

const { data: mvcAssets } = useMVCAssetsQuery(mvcAddress, { enabled: computed(() => !!mvcAddress.value) })

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
    query: { genesis: token.genesis, symbol: token.symbol, address },
  })
}
</script>

<template>
  <div class="mt-8 space-y-5 text-black">
    <div class="space-y-2">
      <div class="text-base font-bold text-gray-900">BTC</div>
      <AssetItem
        v-if="btcAddress"
        v-for="asset in btcAssets || [BTCAsset]"
        :key="asset.symbol"
        :asset="asset"
        :address="btcAddress"
        @click="toNative(asset, btcAddress)"
      />
    </div>

    <div class="space-y-2">
      <div class="text-base font-bold text-gray-900">MVC</div>
      <AssetItem
        v-if="mvcAddress"
        v-for="asset in mvcAssets || [MVCAsset]"
        :key="asset.genesis"
        :asset="asset"
        :address="mvcAddress"
        @click="asset.contract === 'MetaContract' ? toToken(asset, mvcAddress) : toNative(asset, mvcAddress)"
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
