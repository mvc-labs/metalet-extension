<script lang="ts" setup>
import { ref, computed, Ref } from 'vue'
import { useRouter } from 'vue-router'

import { getAssetsDisplay } from '@/lib/assets'
import { allAssets } from '@/data/assets'
import { Chain } from '@/lib/account'
import { getAddress } from '@/lib/account'

import AssetItem from './components/AssetItem.vue'

const props = defineProps<{
  purpose: 'receive' | 'send'
}>()

const router = useRouter()

const mvcAddress = ref<string>('')
const btcAddress = ref<string>('')

getAddress('mvc').then((addr) => {
  mvcAddress.value = addr
})
getAddress('btc').then((addr) => {
  btcAddress.value = addr
})

const selectAddress = (chain: Chain) => {
  switch (chain) {
    case 'btc':
      return btcAddress.value
    case 'mvc':
      return mvcAddress.value
    default:
      return ''
  }
}

const assets = ref(allAssets)
const assetsDisplay: Ref<string[]> = ref([])
getAssetsDisplay().then((display) => {
  assetsDisplay.value = display
})
const displayingAssets = computed(() => {
  return assets.value.filter((asset) => assetsDisplay.value.includes(asset.symbol))
})

function selectAsset(asset: any) {
  switch (props.purpose) {
    case 'receive':
      router.push(`/wallet/receive?chain=${asset.chain}`)
      break
    case 'send':
      router.push({
        name: 'send',
        params: {
          symbol: asset.symbol,
          address: asset.symbol === 'BTC' ? btcAddress.value : mvcAddress.value,
        },
      })
      break
  }
}
</script>

<template>
  <div class="space-y-2 divide-y divide-gray-100 text-black">
    <AssetItem
      v-for="asset in displayingAssets"
      v-if="btcAddress && mvcAddress"
      :key="asset.symbol"
      :asset="asset"
      :address="selectAddress(asset.chain)"
      @click="selectAsset(asset)"
    />
  </div>
</template>
