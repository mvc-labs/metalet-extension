import { SymbolUC } from '@/lib/asset-symbol'
import BtcLogoImg from '../assets/images/btc-logo.svg?url'
import OrdiLogoImg from '../assets/images/ordi-logo.svg?url'
import SpaceLogoImg from '../assets/images/space-logo.svg?url'

export type Asset = {
  symbol: SymbolUC
  logo: string
  tokenName: string
  isNative: boolean
  chain: 'btc' | 'mvc'
  queryable: boolean
  decimal: number
  total?: number
  genesis?: string
  contract?: string
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
    bg: '#999FFF',
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

const BTCAssets: Asset[] = [
  {
    symbol: 'BTC',
    logo: BtcLogoImg,
    tokenName: 'BTC',
    isNative: true,
    chain: 'btc',
    queryable: true,
    decimal: 8,
  },
  {
    symbol: 'ORDI',
    logo: OrdiLogoImg,
    tokenName: 'ORDI',
    isNative: false,
    chain: 'btc',
    queryable: true,
    decimal: 0,
    contract: 'BRC-20',
  },
  {
    symbol: 'ORXC',
    logo: OrdiLogoImg,
    tokenName: 'ORXC',
    isNative: false,
    chain: 'btc',
    queryable: true,
    decimal: 0,
    contract: 'BRC-20',
  },
]

const MVCAssets: Asset[] = [
  {
    symbol: 'SPACE',
    logo: SpaceLogoImg,
    tokenName: 'SPACE',
    isNative: true,
    chain: 'mvc',
    queryable: true,
    decimal: 8,
  },
]

const allAssets = [...BTCAssets, ...MVCAssets]

export { BTCAssets, MVCAssets, allAssets, getTags, getTagInfo }
