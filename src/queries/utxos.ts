<<<<<<< HEAD
import { metaletApi, mvcApi } from './request'
=======
import { metaletApi } from './request'
>>>>>>> 96a757471f129422411e5ed45744a29cd247eed2

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
<<<<<<< HEAD

export const fetchUtxos = async (address: string): Promise<any[]> => {
  console.log('fetchUtxos', address)
  const utxos: any = await mvcApi(`/address/${address}/utxo`).get()

  return utxos
}
=======
>>>>>>> 96a757471f129422411e5ed45744a29cd247eed2
