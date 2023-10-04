import { computed, ref, watch } from 'vue'
// import { currentAccount } from './account'

interface Asset {
  name: string
  value: number
}

export const assetList = ref<Asset[]>([])

export const totalBalance = computed(() => assetList.value.reduce((sum, asset) => sum + asset.value, 0))

// watch(
//   () => currentAccount.value?.btc.addressType,
//   () => {
//     assetList.value = []
//   }
// )

export async function updateAsset(asset: Asset) {
  const preAsset = assetList.value.find((assetItem) => assetItem.name === asset.name)
  if (!preAsset) {
    assetList.value.push(asset)
  } else {
    preAsset.value = asset.value
  }
}
