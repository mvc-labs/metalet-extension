import { computed, ref } from 'vue'

interface Asset {
  name: string
  value: number
}

export const totalBalance = computed(() => {
  return assetList.value.reduce((sum, asset) => sum + asset.value, 0)
})

export const assetList = ref<Asset[]>([])

export async function updateAsset(asset: Asset) {
  const preAsset = assetList.value.find((assetItem) => assetItem.name === asset.name)
  if (!preAsset) {
    assetList.value.push(asset)
  } else {
    preAsset.value = asset.value
  }
}
