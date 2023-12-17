import { SymbolTicker } from '@/lib/asset-symbol'
import BtcLogoImg from '../assets/images/btc-logo.svg?url'
import SpaceLogoImg from '../assets/images/space-logo.svg?url'

export type Asset = {
  symbol: SymbolTicker
  logo?: string
  tokenName: string
  isNative: boolean
  chain: 'btc' | 'mvc'
  queryable: boolean
  decimal: number
  total?: number
  genesis?: string
  contract?: string
  codeHash?: string
}

export interface Tag {
  name: string
  bg: string
  color: string
}

const tags: Tag[] = [
  {
    name: 'BTC',
    bg: '#F7931A',
    color: '#ffffff',
  },
  {
    name: 'BRC-20',
    bg: 'rgb(247, 147, 26, 0.2)',
    color: '#FF981C',
  },
  {
    name: 'MVC',
    bg: '#767EFF',
    color: '#fff',
  },
  {
    name: 'MetaContract',
    bg: 'rgba(153,159,255,0.2)',
    color: '#787FFF',
  },
]

function getTagInfo(name: string): Tag | undefined {
  return tags.find((tag) => tag.name === name)
}

function getTags(asset: Asset): Tag[] {
  const tagList: Tag[] = []
  const chainTag = getTagInfo(asset.chain.toUpperCase())
  if (chainTag) {
    tagList.push(chainTag)
  }
  if (asset.contract) {
    const contractTag = getTagInfo(asset.contract)
    if (contractTag) {
      tagList.push(contractTag)
    }
  }
  return tagList
}

const BTCAsset: Asset = {
  symbol: 'BTC',
  logo: BtcLogoImg,
  tokenName: 'BTC',
  isNative: true,
  chain: 'btc',
  queryable: true,
  decimal: 8,
}

const MVCAsset: Asset = {
  symbol: 'SPACE',
  logo: SpaceLogoImg,
  tokenName: 'SPACE',
  isNative: true,
  chain: 'mvc',
  queryable: true,
  decimal: 8,
}

const allAssets = [BTCAsset, MVCAsset]

export { BTCAsset, MVCAsset, allAssets, getTags, getTagInfo }
