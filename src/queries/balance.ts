import { ComputedRef, Ref } from 'vue'
import { network } from '@/lib/network'
import { useQuery } from '@tanstack/vue-query'
import { SymbolTicker } from '@/lib/asset-symbol'
import { metaletApi, metaletApiV3, mvcApi, unisatApi } from './request'
import { fetchTokenBalance, useMVCTokenQuery } from '@/queries/tokens'

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

// TODO Test to avoid request /address/brc20/asset
export const fetchBRC20Balance = async (address: string, symbol: SymbolTicker): Promise<Balance> => {
  const { tickList } = await metaletApi(`/address/brc20/asset`)
    .get({ address, chain: 'btc', tick: symbol.toLowerCase() })
    .then((res) => res.data)

  const tickAsset = tickList.find((tick: Tick) => tick.token === symbol)

  if (tickAsset) {
    return {
      address,
      total: Number(tickAsset.balance),
      transferBalance: Number(tickAsset.transferBalance),
      availableBalance: Number(tickAsset.availableBalance),
    }
  }

  return {
    address,
    availableBalance: 0,
    transferBalance: 0,
    total: 0,
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
  options: { enabled: ComputedRef<boolean> },
  params?: { contract?: string; genesis?: string }
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
          if (params?.contract === 'BRC-20') {
            return fetchBRC20Balance(address.value, symbol.value)
          } else if (params?.contract === 'MetaContract') {
            // const { data: token } = useMVCTokenQuery(address, params?.genesis || '', options)
            // return {
            //   address: address.value,
            //   confirmed: token.value?.confirmed || 0,
            //   unconfirmed: token.value?.unconfirmed || 0,
            //   total: (token.value?.unconfirmed || 0) + (token.value?.confirmed || 0),
            // }
            return fetchTokenBalance(address.value, params?.genesis || '')
          }
          return doNothing(address.value)
        }
      }
    },
    ...options,
  })
}
