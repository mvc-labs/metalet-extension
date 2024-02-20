import dayjs from 'dayjs'
import { Ref, ComputedRef } from 'vue'
import { getNet } from '@/lib/network'
import { fetchBRC20Token } from './brc20s'
import { useQuery } from '@tanstack/vue-query'
import { ordersApi, metaletApiV3 } from '@/queries/request'

interface Tick {
  token: string
  tokenType: TokenType
  balance: string
  availableBalance: string
  transferBalance: string
}

export const getBTCBalance = (address: string) => {
  return ordersApi('/balance').get({ address })
}

export interface Tx {
  txid: string
  type: 'input' | 'output'
  value: number
  timeStamp: number
  time: string
}

export const getBTCActivities = async (address: string): Promise<Tx[]> => {
  const transactions = (await ordersApi('/activities').get({ address })) as any

  const txs: Tx[] = []

  for (let tx of transactions) {
    for (let input of tx.vin) {
      if (input.prevout.scriptpubkey_address === address) {
        txs.push({
          txid: tx.txid,
          type: 'output',
          value: input.prevout.value,
          timeStamp: tx.status.block_time,
          time: dayjs(tx.status.block_time * 1000).format('YYYY/MM/DD HH:mm'),
        })
      }
    }

    for (let output of tx.vout) {
      if (output.scriptpubkey_address === address) {
        txs.push({
          txid: tx.txid,
          type: 'input',
          value: output.value,
          timeStamp: tx.status.block_time,
          time: dayjs(tx.status.block_time * 1000).format('YYYY/MM/DD HH:mm'),
        })
      }
    }
  }
  txs.sort((a, b) => b.timeStamp - a.timeStamp)
  return txs
}

export const getBTCPrice = () => {
  return ordersApi('/btc-price').get()
}

type TokenType = 'BRC20'

export const useBRC20AssetQuery = (address: Ref<string>, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['BRC20Assets', { address }],
    queryFn: () => fetchBRC20Token(address.value),
    ...options,
  })
}

export interface TokenInfo {
  totalSupply: string
  totalMinted: string
}

export interface TokenBalance {
  availableBalance: string
  overallBalance: string
  ticker: string
  transferableBalance: string
  availableBalanceSafe: string
  availableBalanceUnSafe: string
}

export interface TokenTransfer {
  ticker: string
  amount: string
  inscriptionId: string
  inscriptionNumber: number
  timestamp: number
}

export interface AddressTokenSummary {
  tokenInfo: TokenInfo
  tokenBalance: TokenBalance
  historyList: TokenTransfer[]
  transferableList: TokenTransfer[]
}

export async function fetchBRC20TokenDetail(address: string, ticker: string): Promise<AddressTokenSummary> {
  const net = await getNet()
  return await metaletApiV3<AddressTokenSummary>('/brc20/token-summary').get({
    net,
    address,
    ticker: encodeURIComponent(ticker),
  })
}

export const useBRCTickerAseetQuery = (
  addressRef: Ref<string>,
  tickerRef: Ref<string>,
  options: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['BRCTicker', { address: addressRef.value, ticker: tickerRef.value }],
    queryFn: () => fetchBRC20TokenDetail(addressRef.value, tickerRef.value),
    ...options,
  })
}
