import { ComputedRef } from 'vue'
import { PageResult } from './types'
import { getNet } from '@/lib/network'
import { metaletApiV3 } from './request'
import { useQuery } from '@tanstack/vue-query'

export const fetchBtcTxHex = async (txId: string): Promise<string> => {
  const net = await getNet()
  return metaletApiV3<{ rawTx: string }>(`/tx/raw`)
    .get({ net, txId, chain: 'btc' })
    .then((res) => res.rawTx)
}

export const broadcastBTCTx = async (rawTx: string) => {
  const net = await getNet()
  return await metaletApiV3<string>(`/tx/broadcast`).post({ chain: 'btc', net, rawTx })
}

export interface FeeRate {
  title: string
  desc: string
  feeRate: number
}

export const getBTCTRate = async (): Promise<PageResult<FeeRate>> => {
  const net = await getNet()
  return metaletApiV3<PageResult<FeeRate>>(`/btc/fee/summary`).get({ net })
}

export const useBTCRateQuery = (options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['BTCTRate'],
    queryFn: () => getBTCTRate(),
    select: (result) => result.list.reverse(),
    ...options,
  })
}
