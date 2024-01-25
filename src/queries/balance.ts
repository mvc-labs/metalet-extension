import { ComputedRef, Ref } from 'vue'
import { getNetwork } from '@/lib/network'
import { useQuery } from '@tanstack/vue-query'
import { SymbolTicker } from '@/lib/asset-symbol'
import { metaletApiV3, mvcApi, unisatApi } from './request'
import Decimal from 'decimal.js'

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
  balance.total = new Decimal(balance.confirmed).add(balance.unconfirmed).toNumber()
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
  const network = await getNetwork()
  if (network === 'testnet') {
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
    total: new Decimal(data.balance).mul(1e8).toNumber(),
    confirmed: new Decimal(data.block.incomeFee).mul(1e8).toNumber(),
    unconfirmed: new Decimal(data.mempool.incomeFee).mul(1e8).toNumber(),
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
