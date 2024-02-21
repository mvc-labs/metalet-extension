import { PageResult } from './types'
import { getNet } from '@/lib/network'
import { type Asset } from '@/data/assets'
import { getBRC20Logo } from '@/data/logos'
import { metaletApiV3 } from './request'
import { SymbolTicker } from '@/lib/asset-symbol'

export type Brc20 = {
  symbol: SymbolTicker
  balance: string
  availableBalance: string
  transferBalance: string
}

interface TickerInfo {
  completeBlocktime: number
  completeHeight: number
  confirmedMinted: string
  confirmedMinted1h: string
  confirmedMinted24h: string
  creator: string
  decimal: string
  deployBlocktime: number
  deployHeight: number
  historyCount: number
  holdersCount: number
  inscriptionId: string
  inscriptionNumber: number
  inscriptionNumberEnd: number
  inscriptionNumberStart: number
  limit: string
  max: string
  mintTimes: number
  minted: string
  ticker: string
  totalMinted: number
  txid: string
}

export const getTickerInfo = async (tick: string): Promise<TickerInfo> => {
  const net = await await getNet()
  return await metaletApiV3<TickerInfo>(`/brc20/tick/info`).get({ net, tick })
}

interface TokenBalance {
  ticker: string
  overallBalance: string
  transferableBalance: string
  availableBalance: string
  availableBalanceSafe: string
  availableBalanceUnSafe: string
  decimal: number
}

export const fetchBRC20Token = async (address: string): Promise<Asset[]> => {
  const net = await await getNet()
  return (
    await metaletApiV3<PageResult<TokenBalance>>(`/brc20/tokens`).get({ net, address, cursor: '0', size: '100000' })
  ).list.map(
    (token) =>
      ({
        symbol: token.ticker,
        logo: getBRC20Logo(token.ticker),
        tokenName: token.ticker,
        isNative: false,
        chain: 'btc',
        queryable: true,
        decimal: 0,
        contract: 'BRC-20',
        balance: {
          total: Number(token.overallBalance),
          availableBalance: Number(token.availableBalance),
          transferBalance: Number(token.transferableBalance),
        },
      }) as Asset
  )
}

export interface TokenInfo {
  totalSupply: string
  totalMinted: string
}

export interface TokenTransfer {
  ticker: string
  amount: string
  inscriptionId: string
  inscriptionNumber: number
  timestamp: number
}
