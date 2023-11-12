import { metaletApi, metaletApiV2, mempoolApi, unisatApi, blockstreamApi } from './request'

export const fetchBtcTxHex = async (txId: string): Promise<string> => {
  return metaletApi(`/tx/raw`)
    .get({ txId, chain: 'btc' })
    .then(({ data: { rawTx } }) => {
      return rawTx
    })
}

// export const broadcastBTCTx = async (rawTx: string): Promise<string> => {
//   return unisatApi<string>(`/tx/broadcast`).post({ rawTx })
// }

export const broadcastBTCTx = async (rawTx: string): Promise<string> => {
  const headers = new Headers()
  headers.append('Content-Type', 'text/plain')
  return mempoolApi(`/tx`).post(rawTx, headers)
}

// export const broadcastBTCTx = async (rawTx: string): Promise<string> => {
//   return blockstreamApi(`/tx`).post(rawTx)
// }

export const getBTCTRate = async (): Promise<any> => {
  return unisatApi(`/default/fee-summary`).get()
}
