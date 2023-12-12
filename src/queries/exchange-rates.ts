import { ComputedRef, Ref } from 'vue'
import { metaletApi } from './request'
import { useQuery } from '@tanstack/vue-query'
import { SymbolTicker, DEFAULT_SYMBOLS } from '@/lib/asset-symbol'

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

export const doNothing = async (symbol: SymbolTicker): Promise<RawRates> => ({
  [symbol.toLowerCase()]: 0,
})

export const useExchangeRatesQuery = (
  symbolRef: Ref<SymbolTicker>,
  contract?: string,
  options?: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['exchangeRates', { symbol: symbolRef.value, contract }],
    queryFn: () => {
      if (contract === 'BRC-20') {
        return fetchTickExchangeRates()
      }

      if (DEFAULT_SYMBOLS.includes(symbolRef.value)) {
        return fetchExchangeRates()
      }

      return doNothing(symbolRef.value)
    },
    select: (rates: RawRates) => {
      const rate = rates[symbolRef.value.toLowerCase()]
      return { symbol: symbolRef.value, price: rate }
    },
    ...options,
  })
}
