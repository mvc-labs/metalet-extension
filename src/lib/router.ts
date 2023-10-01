import { useRouter } from 'vue-router'
import { type Asset } from '@/data/assets'

const router = useRouter()

export function toManageAssets() {
  router.push('/wallet/manage-assets')
}

export function toNative(asset: Asset) {
  router.push({
    name: 'asset',
    params: { symbol: asset.symbol },
  })
}

export function toWelcome() {
  router.push('/welcome')
}
