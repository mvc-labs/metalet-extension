import { metaletApi } from "./request"

export const fetchBtcTxHex = async (txid: string): Promise<string> => {
  return metaletApi(`/tx/raw`)
    .get({
      txId: txid,
      chain: 'btc',
    })
    .then((transaction: { rawTx: string }) => {
      return transaction.rawTx
    })
}