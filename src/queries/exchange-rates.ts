import { useQuery } from '@tanstack/vue-query'
import axios from 'axios'
import { ComputedRef, Ref } from 'vue'
import { getBTCPrice } from '@/queries/btc'

import { MVC_API_HOST } from '../data/hosts'
import { metaletApi } from './request'

export type Rate = {
  symbol: string
  price: number
}

export type RawRates = {
  btc: number
  space: number
}
export const fetchExchangeRates = async (): Promise<RawRates> => {
  return await metaletApi(`/coin/price`)
    .get()
    .then((res) => res.data.priceInfo)
}

export const useExchangeRatesQuery = (symbol: string, options?: { enabled: ComputedRef<boolean> }) => {
  const symbolLC = symbol.toLowerCase() as 'btc' | 'space'
  return useQuery({
    queryKey: ['exchangeRates', { symbol }],
    queryFn: () => fetchExchangeRates(),
    select: (rates: RawRates) => {
      const rate = rates[symbolLC]
      return {
        symbol,
        price: rate,
      }
    },
    ...options,
  })
}
