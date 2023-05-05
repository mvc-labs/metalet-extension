import { useQuery } from '@tanstack/vue-query'
import { metasvApi } from './request'
import { ComputedRef, Ref } from 'vue'

export type Balance = {
  address: string
  confirmed: number
  unconfirmed: number
}

export const fetchSpaceBalance = async (address: string): Promise<Balance> => {
  const balance: any = await metasvApi(`/address/${address}/balance`).get()
  balance.total = balance.confirmed + balance.unconfirmed

  return balance
}

export const doNothing = async (): Promise<Balance> => {
  return {
    address: '',
    confirmed: 0,
    unconfirmed: 0,
  }
}

export const useBalanceQuery = (address: Ref, symbol: string, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['balance', { address: address.value, symbol }],
    queryFn: () => {
      switch (symbol) {
        case 'MVC':
          return fetchSpaceBalance(address.value)
        default:
          return doNothing()
      }
    },
    select: (data: Balance) => data.confirmed + data.unconfirmed,
    ...options,
  })
}
