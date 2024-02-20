import { ComputedRef, Ref } from 'vue'
import { metaletApiV3 } from './request'
import { useQuery } from '@tanstack/vue-query'
import { SymbolTicker, DEFAULT_SYMBOLS } from '@/lib/asset-symbol'

type RawRates = Record<string, number | undefined>

export const fetchExchangeRates = async (): Promise<RawRates> => {
  return await metaletApiV3<{ priceInfo: RawRates }>(`/coin/price`)
    .get()
    .then((res) => res.priceInfo)
}

export const fetchTickExchangeRates = async (): Promise<RawRates> => {
  return await metaletApiV3<{ priceInfo: RawRates }>(`/coin/brc20/price`)
    .get()
    .then((res) => res.priceInfo)
}

export const fetchFTExchangeRates = async (): Promise<RawRates> => {
  return await metaletApiV3<{ priceInfo: RawRates }>(`/coin/contract/ft/price`)
    .get()
    .then((res) => res.priceInfo)
}

export const doNothing = async (symbol: SymbolTicker): Promise<RawRates> => ({
  [symbol.toLowerCase()]: 0,
})

const getExchangeCoinType = (symbol: SymbolTicker, contract?: string) => {
  if (DEFAULT_SYMBOLS.includes(symbol)) {
    return 'Default'
  } else if (contract === 'BRC-20') {
    return 'BRC-20'
  } else if (contract === 'MetaContract') {
    return 'MetaContract'
  } else {
    throw Error('Unknown coin type')
  }
}

export const useExchangeRatesQuery = (
  symbolRef: Ref<SymbolTicker>,
  contract?: string,
  options?: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['exchangeRates', { type: getExchangeCoinType(symbolRef.value, contract) }],
    queryFn: () => {
      if (contract === 'BRC-20') {
        return fetchTickExchangeRates()
      } else if (contract === 'MetaContract') {
        return fetchFTExchangeRates()
      } else if (DEFAULT_SYMBOLS.includes(symbolRef.value)) {
        return fetchExchangeRates()
      }
      return doNothing(symbolRef.value)
    },
    select: (rates: RawRates) => {
      const rate = rates[contract === 'MetaContract' ? symbolRef.value : symbolRef.value.toLowerCase()]
      return { symbol: symbolRef.value, price: rate }
    },
    ...options,
  })
}
