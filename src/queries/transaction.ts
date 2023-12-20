import { ComputedRef } from 'vue'
import { PageResult } from './types'
import { useQuery } from '@tanstack/vue-query'
import { metaletApi, metaletApiV3 } from './request'

export const fetchBtcTxHex = async (txId: string): Promise<string> => {
  return metaletApi<{ rawTx: string }>(`/tx/raw`)
    .get({ txId, chain: 'btc' })
    .then((res) => res.rawTx)
}

export const broadcastBTCTx = async (rawTx: string) => {
  return await metaletApiV3<string>(`/tx/broadcast`).post({
    chain: 'btc',
    net: 'livenet',
    rawTx,
  })
}

export interface FeeRate {
  title: string
  desc: string
  feeRate: number
}

export const getBTCTRate = async (): Promise<PageResult<FeeRate>> => {
  return metaletApiV3<PageResult<FeeRate>>(`/btc/fee/summary`).get()
}

export const useBTCRateQuery = (options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['BTCTRate'],
    queryFn: () => getBTCTRate(),
    select: (result) => result.list,
    ...options,
  })
}
