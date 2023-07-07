import SpaceLogoImg from '../assets/images/space-logo.svg?url'
import BtcLogoImg from '../assets/images/btc-logo.svg?url'
import McLogoImg from '../assets/images/mc-logo.svg?url'
import ScLogoImg from '../assets/images/sc-logo.svg?url'

export type Asset = {
  symbol: string
  logo: string
  tokenName: string
  isNative: boolean
  color: string
  chain: 'btc' | 'mvc'
  queryable: boolean
  decimal: number
  total?: number
  genesis?: string
}

export default [
  // {
  //   symbol: 'BTC',
  //   logo: BtcLogoImg,
  //   tokenName: 'BTC',
  //   isNative: true,
  //   color: 'bg-orange-100',
  //   chain: 'btc',
  //   queryable: false,
  //   decimal: 8,
  // },
  {
    symbol: 'SPACE',
    logo: SpaceLogoImg,
    tokenName: 'SPACE',
    isNative: true,
    color: 'bg-blue-100',
    chain: 'mvc',
    queryable: true,
    decimal: 8,
  },
  // {
  //   symbol: 'MetaCoin',
  //   logo: McLogoImg,
  //   tokenName: 'MC',
  //   isNative: false,
  //   color: 'bg-indigo-100',
  //   chain: 'mvc',
  //   queryable: false,
  // },
  // {
  //   symbol: 'ShowCoin',
  //   logo: ScLogoImg,
  //   tokenName: 'SC',
  //   isNative: false,
  //   color: 'bg-amber-100',
  //   chain: 'mvc',
  //   queryable: false,
  // },
] as Asset[]
