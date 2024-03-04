<script lang="ts" setup>
import { Chain } from '@/lib/account'
import { allAssets } from '@/data/assets'
import { getAddress } from '@/lib/account'
import { getAssetsDisplay } from '@/lib/assets'
import { ref, computed, Ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AssetItem from './components/AssetItem.vue'
import SearchInput from '@/components/SearchInput.vue'

const assetSearch = ref()

const route = useRoute()
const router = useRouter()
const { purpose } = route.params

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
  return assets.value.filter(
    (asset) =>
      assetsDisplay.value.includes(asset.symbol) &&
      (!assetSearch.value ||
        asset.symbol.toLocaleLowerCase().includes(assetSearch.value) ||
        asset.tokenName.toLocaleLowerCase().includes(assetSearch.value))
  )
})

function selectAsset(asset: any) {
  switch (purpose) {
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
  <div class="pt-2 space-y-2">
    <SearchInput v-model:assetSearch="assetSearch" />
    <AssetItem
      :asset="asset"
      :key="asset.symbol"
      @click="selectAsset(asset)"
      v-if="btcAddress && mvcAddress"
      v-for="asset in displayingAssets"
      :address="selectAddress(asset.chain)"
    />
  </div>
</template>
