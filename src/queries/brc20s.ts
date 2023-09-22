import { useQuery } from '@tanstack/vue-query'
import { ComputedRef, Ref } from 'vue'

import { SymbolUC } from '@/lib/asset-symbol'
import tokens from '@/data/tokens'
import { metaletApi, mvcApi } from './request'

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
