import { computed, ref } from 'vue'
import { type Chain } from './account'

interface Asset {
  chain: Chain
  name: string
  value: number
}

export const assetList = ref<Asset[]>([])

export const totalBalance = computed(() => assetList.value.reduce((sum, asset) => sum + (asset.value || 0), 0))

export const resetAssetList = () => {
  assetList.value = []
}

export async function updateAsset(asset: Asset) {
  const preAsset = assetList.value.find((assetItem) => assetItem.name === asset.name && assetItem.chain === asset.chain)
  if (!preAsset) {
    assetList.value.push(asset)
  } else {
    preAsset.value = asset.value
  }
}
