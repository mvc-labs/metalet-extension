import { metaletApi, mvcApi, unisatApi } from './request'

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

export const fetchUtxos = async (address: string): Promise<any[]> => {
  const utxos: any = await mvcApi(`/address/${address}/utxo`).get()

  return utxos
}

export async function getInscriptionUtxos(inscriptionIds: string[]): Promise<any> {
  return await unisatApi('/inscription/utxos').post({ inscriptionIds })
}

export async function getInscriptionUtxo(inscriptionId: string): Promise<any> {
  return await unisatApi('/inscription/utxo').get({ inscriptionId })
}

export async function getAddressInscriptions(address: string, cursor = 1, size = 10): Promise<any> {
  return await unisatApi('/address/inscriptions').get({ address, cursor, size })
}
