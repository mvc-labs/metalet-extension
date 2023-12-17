import { computed, ref } from 'vue'

interface Asset {
  name: string
  value: number
}

export const assetList = ref<Asset[]>([])

export const totalBalance = computed(() => assetList.value.reduce((sum, asset) => sum + (asset.value || 0), 0))

export async function updateAsset(asset: Asset) {
  const preAsset = assetList.value.find((assetItem) => assetItem.name === asset.name)
  if (!preAsset) {
    assetList.value.push(asset)
  } else {
    preAsset.value = asset.value
  }
}
