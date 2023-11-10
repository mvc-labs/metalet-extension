import { metaletApi, metaletApiV2, mempoolApi, unisatApi } from './request'

export const fetchBtcTxHex = async (txId: string): Promise<string> => {
  return metaletApi(`/tx/raw`)
    .get({ txId, chain: 'btc' })
    .then(({ data: { rawTx } }) => {
      return rawTx
    })
}

export const broadcastBTCTx = async (rawTx: string): Promise<string> => {
  const headers = new Headers()
  headers.append('Content-Type', 'plain/text')
  return mempoolApi(`/tx`).post(rawTx, headers)
}

export const getBTCTRate = async (): Promise<any> => {
  return unisatApi(`/default/fee-summary`).get()
}
