import { metasvApi } from './request'

export const fetchUtxos = async (address: string): Promise<any[]> => {
  console.log('fetchUtxos', address)
  const utxos: any = await metasvApi(`/address/${address}/utxo`).get()

  return utxos
}
