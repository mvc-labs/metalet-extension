import { ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { metaletApi, metaletApiV3, unisatApi, metaletApiV2 } from './request'

export const fetchBtcTxHex = async (txId: string): Promise<string> => {
  return metaletApi(`/tx/raw`)
    .get({ txId, chain: 'btc' })
    .then(({ data: { rawTx } }) => {
      return rawTx
    })
}

export const broadcastBTCTx = async (rawTx: string): Promise<string> => {
  return metaletApiV2<{ code: number; data: string; msg: string }>(`/tx/broadcast`)
    .post({
      chain: 'btc',
      net: 'livenet',
      rawTx,
    })
    .then((result) => {
      if (result.code === 0) {
        return result.data
      } else {
        throw Error(result.msg)
      }
    })
}

// export const broadcastBTCTx = async (rawtx: string): Promise<string> => {
//   return unisatApi<string>(`/tx/broadcast`).post({ rawtx })
// }

export const getBTCTRate = async (): Promise<any> => {
  return metaletApiV3(`/btc/fee/summary`).get()
}

export const useBTCRateQuery = (options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['BTCTRate'],
    queryFn: () => getBTCTRate(),
    ...options,
  })
}
