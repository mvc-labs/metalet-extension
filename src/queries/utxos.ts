import { Chain } from '@/lib/account'
import { mvcApi, metaletApiV2, unisatApi } from './request'

export interface UTXO {
  address: string
  codeType: number
  height: number
  idx: number
  inscriptions: string[]
  isOpInRBF: boolean
  satoshi: number
  scriptPk: string
  scriptType: string
  txId: string
  vout: number
}

export type MvcUtxo = {
  flag: string
  address: string
  txid: string
  outIndex: number
  value: number
  height: number
}
const fetchMVCUtxos = async (address: string): Promise<MvcUtxo[]> => {
  return await mvcApi(`/address/${address}/utxo`).get()
}

// Fetch BTC address non inscription UTXO utxos
const fetchBTCUtxos = async (address: string): Promise<UTXO[]> => {
  const {
    data: { utxo },
  } = await metaletApiV2(`/address/utxos`).get({
    address,
    chain: 'btc',
  })

  return utxo
}

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
  const utxos = await metaletApiV2('/address/utxos')
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

export const fetchUtxos = async (chain: Chain = 'mvc', address: string): Promise<any[]> => {
  if (chain === 'mvc') {
    return await fetchMVCUtxos(address)
  } else {
    return await fetchBTCUtxos(address)
  }
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
