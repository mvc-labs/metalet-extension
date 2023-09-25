import { mvcApi } from './request'

export const fetchUtxos = async (address: string): Promise<any[]> => {
  console.log('fetchUtxos', address)
  const utxos: any = await mvcApi(`/address/${address}/utxo`).get()

  return utxos
}
