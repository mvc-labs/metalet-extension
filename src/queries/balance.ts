import { ComputedRef, Ref } from 'vue'
import { network } from '@/lib/network'
import { useQuery } from '@tanstack/vue-query'
import { SymbolTicker } from '@/lib/asset-symbol'
import { fetchTokenBalance } from '@/queries/tokens'
import { metaletApiV3, mvcApi, unisatApi } from './request'

type TokenType = 'BRC20'

interface Tick {
  token: SymbolTicker
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

interface BTCBalance {
  balance: number
  block: {
    incomeFee: number
    spendFee: number
  }
  mempool: {
    incomeFee: number
    spendFee: number
  }
}

export interface BitcoinBalance {
  confirm_amount: string
  pending_amount: string
  amount: string
  confirm_btc_amount: string
  pending_btc_amount: string
  btc_amount: string
  confirm_inscription_amount: string
  pending_inscription_amount: string
  inscription_amount: string
  usd_value: string
}

export const fetchBtcBalance = async (address: string): Promise<Balance> => {
  if (network.value === 'testnet') {
    const data = await unisatApi<BitcoinBalance>(`/address/balance`).get({ address })
    return {
      address,
      total: Number(data.btc_amount) * 10 ** 8,
      confirmed: Number(data.confirm_amount) * 10 ** 8,
      unconfirmed: Number(data.pending_amount) * 10 ** 8,
    }
  }
  const data = await metaletApiV3<BTCBalance>(`/address/btc-balance`).get({ address })
  return {
    address,
    total: data.balance * 10 ** 8,
    confirmed: data.block.incomeFee * 10 ** 8,
    unconfirmed: data.mempool.incomeFee * 10 ** 8,
  }
}

export const doNothing = async (address: string): Promise<Balance> => {
  return {
    address,
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  }
}

export const useBalanceQuery = (
  address: Ref<string>,
  symbol: Ref<SymbolTicker>,
  options: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['balance', { address: address.value, symbol: symbol.value }],
    queryFn: () => {
      switch (symbol.value) {
        case 'SPACE':
          return fetchSpaceBalance(address.value)
        case 'BTC':
          return fetchBtcBalance(address.value)
        default: {
          return doNothing(address.value)
        }
      }
    },
    ...options,
  })
}
