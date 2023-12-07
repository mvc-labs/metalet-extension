import { useQuery } from '@tanstack/vue-query'
import { ComputedRef, Ref } from 'vue'

import { SymbolUC } from '@/lib/asset-symbol'
import { metaletApi, metaletApiV3 } from './request'

export type Brc20 = {
  symbol: SymbolUC
  balance: string
  availableBalance: string
  transferBalance: string
}

type RawBrc20 = {
  token: SymbolUC
  balance: string
  tokenType: 'BRC20'
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
  return await metaletApiV3<TickerInfo>(`/brc20/tick/info`).get({ tick })
}

export const fetchBrc20s = async (address: string): Promise<RawBrc20[]> => {
  const tokens: any = await metaletApi(`/address/brc20/asset`)
    .get({ address, chain: 'btc' })
    .then((res) => res.data?.tickList || [])

  return tokens
}

export const useBrc20sQuery = (address: Ref, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['brc20s', { address: address.value }],
    queryFn: () => fetchBrc20s(address.value),
    select: (tokens) => {
      return tokens.map((token) => {
        return {
          ...token,
          symbol: token.token,
        }
      })
    },
    ...options,
  })
}
