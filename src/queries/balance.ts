import { useQuery } from '@tanstack/vue-query'
import { metaletApi, mvcApi, ordersApi } from './request'
import { ComputedRef, Ref } from 'vue'
import { getBTCBalance } from '@/queries/btc'

export type Balance = {
  address: string
  confirmed: number
  unconfirmed: number
  total: number
}

export const fetchSpaceBalance = async (address: string): Promise<Balance> => {
  const balance: any = await mvcApi(`/address/${address}/balance`).get()
  balance.total = balance.confirmed + balance.unconfirmed

  return balance
}

export const fetchBtcBalance = async (address: string): Promise<Balance> => {
  const balance: any = await metaletApi(`/address/balance`)
    .get({ address, chain: 'btc' })
    .then((res) => res.data)

  balance.total = balance.confirmed + balance.unconfirmed

  return balance
}

export const doNothing = async (): Promise<Balance> => {
  return {
    address: '',
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  }
}

export const getBalance = async (address: string, symbol: string): Promise<number> => {
  console.log('symbol', symbol)
  switch (symbol) {
    case 'SPACE': {
      const { confirmed, unconfirmed } = await fetchSpaceBalance(address)
      return confirmed + unconfirmed
    }
    case 'BTC': {
      console.log('what?')
      const { confirmed, unconfirmed } = await getBTCBalance(address)
      return confirmed + unconfirmed
    }
    default:
      return 0
  }
}

export const useBalanceQuery = (address: Ref, symbol: string, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['balance', { address, symbol }],
    queryFn: () => {
      switch (symbol) {
        case 'SPACE':
          return fetchSpaceBalance(address.value)
        case 'BTC':
          return fetchBtcBalance(address.value)
        default:
          return doNothing()
      }
    },
    select: (data: Balance) => data.confirmed + data.unconfirmed,
    ...options,
  })
}
