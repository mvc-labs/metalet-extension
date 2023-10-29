<script lang="ts" setup>
import { ref, computed, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { allAssets } from '@/data/assets'
import AssetItem from './components/AssetItem.vue'
// import { getAssetsDisplay } from '@/lib/assets'
import { createEmit } from '@/lib/emitters'
import { Chain } from '@/lib/account'

const props = defineProps<{
  purpose: 'receive' | 'send'
}>()

const router = useRouter()

const mvcAddress = ref<string>('')
const btcAddress = ref<string>('')

createEmit<string>('getAddress')('mvc').then((addr) => {
  mvcAddress.value = addr
})
createEmit<string>('getAddress')('btc').then((addr) => {
  btcAddress.value = addr
})

const getAddress = (chain: Chain) => {
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
createEmit<string[]>('getAssetsDisplay')().then((display) => {
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
      router.push(`/wallet/send?symbol=${asset.symbol}`)
      break
  }
}
</script>

<template>
  <div class="space-y-2 divide-y divide-gray-100 text-black">
    <AssetItem v-for="asset in displayingAssets" v-if="btcAddress && mvcAddress" :key="asset.symbol" :asset="asset"
      :address="getAddress(asset.chain)" @click="selectAsset(asset)" />
  </div>
</template>
