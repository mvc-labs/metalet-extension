import { metaletApi, metaletApiV2 } from './request'

export const fetchBtcTxHex = async (txId: string): Promise<string> => {
  return metaletApi(`/tx/raw`)
    .get({ txId, chain: 'btc' })
    .then(({ data: { rawTx } }) => {
      return rawTx
    })
}

export const broadcastBTCTx = async (rawTx: string): Promise<string> => {
  return metaletApiV2(`/tx/broadcast`).post({ rawTx, chain: 'btc' })
}
