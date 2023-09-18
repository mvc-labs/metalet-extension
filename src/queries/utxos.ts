export async function getBtcUtxos(address: string) {
  const utxos = await ordersApi('/utxos').get({ address })

  return utxos

}