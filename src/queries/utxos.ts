import { metaletApi } from './request'

export type Utxo = {
  addressType: number
  outputIndex: number
  satoshis: number
  txid: string
}

type RawBtcUtxo = {
  addressType: number
  outputIndex: number
  satoshis: number
  txId: string
}
export async function fetchBtcUtxos(address: string): Promise<Utxo[]> {
  const utxos = await metaletApi('/address/utxos')
    .get({ address, chain: 'btc' })
    .then((res) => res.data?.utxoList || [])
    .then((utxos: RawBtcUtxo[]) =>
      utxos.map((utxo) => ({
        ...utxo,
        txid: utxo.txId,
      }))
    )

  return utxos
}
