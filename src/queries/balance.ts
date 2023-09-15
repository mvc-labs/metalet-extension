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

export const fetchOrdiBalance = async (address: string): Promise<Balance> => {
  const { tickList } = await metaletApi(`/address/brc20/asset`)
    .get({ address, chain: 'btc' })
    .then((res) => res.data)

  const total = tickList.reduce((sum: number, item: any) => sum + item.balance, 0);

  return {
    address,
    confirmed: total,
    unconfirmed: 0,
    total,
  }
}

export const doNothing = async (): Promise<Balance> => {
  return {
    address: '',
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  }
}

export const useBalanceQuery = (address: Ref, symbol: string, options: { enabled: ComputedRef<boolean> }) => {
  console.log("symbol", symbol)

  return useQuery({
    queryKey: ['balance', { address, symbol }],
    queryFn: () => {
      switch (symbol) {
        case 'SPACE':
          return fetchSpaceBalance(address.value)
        case 'BTC':
          return fetchBtcBalance(address.value)
        case 'ORDI':
          const res = fetchOrdiBalance(address.value)
          console.log("res", res);

          return res
        default:
          return doNothing()
      }
    },
    select: (data: Balance) => data.confirmed + data.unconfirmed,
    ...options,
  })
}
