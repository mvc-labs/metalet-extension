import { useQuery } from '@tanstack/vue-query'
import { metaletApi, metaletApiV3, mvcApi, unisatApi } from './request'
import { ComputedRef, Ref } from 'vue'
import { SymbolUC, BRC20_SYMBOLS } from '@/lib/asset-symbol'
import { brc20TickList } from './btc'

type TokenType = 'BRC20'

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

export const fetchBtcBalance = async (address: string): Promise<Balance> => {
  const data = await metaletApiV3<BTCBalance>(`/address/btc-balance`).get({ address })

  return {
    address,
    total: data.balance * 10 ** 8,
    confirmed: data.block.incomeFee * 10 ** 8,
    unconfirmed: data.mempool.incomeFee * 10 ** 8,
  }
}

export const fetchBRC20Balance = async (address: string, symbol: SymbolUC): Promise<Balance> => {
  if (brc20TickList.value?.length) {
    const brc20TickAsset = brc20TickList.value.find((tick) => tick.token === symbol)
    if (brc20TickAsset) {
      return {
        address,
        total: Number(brc20TickAsset.balance),
        transferBalance: Number(brc20TickAsset.transferBalance),
        availableBalance: Number(brc20TickAsset.availableBalance),
      }
    }
  }
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

export async function getAddressBalance(address: string): Promise<BitcoinBalance> {
  return await unisatApi<BitcoinBalance>('/address/balance').get({ address })
}
