import { useQuery } from '@tanstack/vue-query'
import { metaletApi, mvcApi } from './request'
import { ComputedRef, Ref } from 'vue'
import { SymbolUC, BRC20_SYMBOLS } from '@/lib/asset-symbol'

type TokenType = "BRC20"

interface Tick {
  token: SymbolUC
  tokenType: TokenType
  balance: string
  availableBalance: string
  transferBalance: string
}

export type Balance = {
  address: string
  confirmed?: number
  unconfirmed?: number
  availableBalance?: number
  transferBalance?: number
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

export const fetchBRC20Balance = async (address: string, symbol: SymbolUC): Promise<Balance> => {
  const { tickList } = await metaletApi(`/address/brc20/asset`)
    .get({ address, chain: 'btc', tick: symbol.toLowerCase() })
    .then((res) => res.data)

  const tickAsset = tickList.find((tick: Tick) => tick.token === symbol)

  if (tickAsset) {
    return {
      address,
      availableBalance: Number(tickAsset.availableBalance),
      transferBalance: Number(tickAsset.transferBalance),
      total: Number(tickAsset.balance),
    }
  }

  return {
    address,
    availableBalance: 0,
    transferBalance: 0,
    total: 0,
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

export const useBalanceQuery = (address: Ref, symbol: SymbolUC, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['balance', { address, symbol }],
    queryFn: () => {
      switch (symbol) {
        case 'SPACE':
          return fetchSpaceBalance(address.value)
        case 'BTC':
          return fetchBtcBalance(address.value)
        default: {
          if (BRC20_SYMBOLS.includes(symbol)) {
            return fetchBRC20Balance(address.value, symbol)
          }
          return doNothing()
        }
      }
    },
    ...options,

  })
}
