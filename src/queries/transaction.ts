import { ref, Ref, ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { metaletApi, metaletApiV2, mempoolApi, unisatApi, blockstreamApi } from './request'

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

// export const broadcastBTCTx = async (rawTx: string): Promise<string> => {
//   const headers = new Headers()
//   headers.append('Content-Type', 'text/plain')
//   return mempoolApi(`/tx`).post(rawTx, headers)
// }

// export const broadcastBTCTx = async (rawTx: string): Promise<string> => {
//   return blockstreamApi(`/tx`).post(rawTx)
// }

export const getBTCTRate = async (): Promise<any> => {
  return unisatApi(`/default/fee-summary`).get()
}

export const useBTCRateQuery = (options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['BTCTRate'],
    queryFn: () => getBTCTRate(),
    ...options,
  })
}

export interface InscribeOrder {
  orderId: string
  payAddress: string
  totalFee: number
  minerFee: number
  originServiceFee: number
  serviceFee: number
  outputValue: number
}

export const inscribeBRC20Transfer = async (
  address: string,
  tick: string,
  amount: string,
  feeRate: number
): Promise<InscribeOrder> => {
  return unisatApi<InscribeOrder>(`/brc20/inscribe-transfer`).post({ address, tick, amount, feeRate })
}
