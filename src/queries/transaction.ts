import { ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { metaletApi, metaletApiV3, unisatApi } from './request'

export const fetchBtcTxHex = async (txId: string): Promise<string> => {
  return metaletApi(`/tx/raw`)
    .get({ txId, chain: 'btc' })
    .then(({ data: { rawTx } }) => {
      return rawTx
    })
}

export const broadcastBTCTx = async (rawtx: string): Promise<string> => {
  return unisatApi<string>(`/tx/broadcast`).post({ rawtx })
}

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
