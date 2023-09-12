import { useQuery } from '@tanstack/vue-query'
import axios from 'axios'
import { ComputedRef, Ref } from 'vue'
import { getBTCPrice } from '@/queries/btc'

import { MVC_API_HOST } from '../data/hosts'

export type Rate = {
  symbol: string
  price: {
    CNY: string
    USD: string
  }
  remark: string
  updateTime: number
}

export const fetchExchangeRates = async (): Promise<Rate[]> => {
  const response = await axios.get(`${MVC_API_HOST}/metaid-base/v1/exchange/rates`)

  return response.data.result.rates
}

export const useExchangeRatesQuery = (symbol: string, options?: { enabled: ComputedRef<boolean> }) => {
  const symbolLC = symbol.toLowerCase()
  return useQuery({
    queryKey: ['exchangeRates', { symbol }],
    queryFn: () => fetchExchangeRates(),
    select: (rates: Rate[]) => rates.find((rate) => rate.symbol === symbolLC)?.price,
    ...options,
  })
}

export const getExchangeRate = async (symbol: string): Promise<string> => {
  switch (symbol) {
    case 'SPACE': {
      const rates = await fetchExchangeRates()
      return rates.find((rate) => rate.symbol === "mvc")?.price.USD || '0'
    }
    case 'BTC': {
      return await getBTCPrice()
    }
    default:
      return '0'
  }
}
