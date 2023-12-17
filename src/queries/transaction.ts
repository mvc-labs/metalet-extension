import { ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { metaletApi, metaletApiV3, unisatApi, metaletApiV2 } from './request'
import { PageResult } from './types'

export const fetchBtcTxHex = async (txId: string): Promise<string> => {
  return metaletApi(`/tx/raw`)
    .get({ txId, chain: 'btc' })
    .then(({ data: { rawTx } }) => {
      return rawTx
    })
}

export const broadcastBTCTx = async (rawTx: string) => {
  return await metaletApiV3<string>(`/tx/broadcast`).post({
    chain: 'btc',
    net: 'livenet',
    rawTx,
  })
  // .then((result) => {
  //   if (result.code === 0) {
  //     return result.data
  //   } else {
  //     throw Error(result.msg)
  //   }
  // })
}

// export const broadcastBTCTx = async (rawtx: string): Promise<string> => {
//   return unisatApi<string>(`/tx/broadcast`).post({ rawtx })
// }

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
