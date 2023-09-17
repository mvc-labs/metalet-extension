import { ComputedRef } from 'vue'
import { metaletApi } from './request'
import { useQuery } from '@tanstack/vue-query'
import { SymbolUC, DEFAULT_SYMBOLS, BRC20_SYMBOLS } from '@/lib/asset-symbol'

type RawRates = Record<string, number>

export const fetchExchangeRates = async (): Promise<RawRates> => {
  return await metaletApi(`/coin/price`)
    .get()
    .then((res) => res.data.priceInfo)
}

// Fetch BRC-20 coin tick price
export const fetchTickExchangeRates = async (): Promise<RawRates> => {
  return await metaletApi(`/coin/tick/price`)
    .get()
    .then((res) => res.data.priceInfo)
}

export const doNothing = async (symbol: SymbolUC): Promise<RawRates> => ({
  [symbol.toLowerCase()]: 0
})

export const useExchangeRatesQuery = (symbol: SymbolUC, options?: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['exchangeRates', { symbol }],
    queryFn: () => {
      if (BRC20_SYMBOLS.includes(symbol)) {
        return fetchTickExchangeRates()
      }

      if (DEFAULT_SYMBOLS.includes(symbol)) {
        return fetchExchangeRates()
      }

      return doNothing(symbol)
    },
    select: (rates: RawRates) => {
      const rate = rates[symbol.toLowerCase()]
      return { symbol, price: rate }
    },
    ...options,
  })
}
