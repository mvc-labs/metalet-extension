import { Chain } from '@/lib/account'
import { getNet } from '@/lib/network'
import { Ref, ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mvcApi, mempoolApi, metaletApiV3 } from './request'

export interface UTXO {
  txId: string
  outputIndex: number
  satoshis: number
  confirmed: boolean
  inscriptions:
    | {
        id: string
        num: number
      }[]
    | null
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
  return (await mvcApi<MvcUtxo[]>(`/address/${address}/utxo`)).get()
}

export type Utxo = {
  addressType: number
  outputIndex: number
  satoshis: number
  satoshi: number
  txid: string
  txId: string
  vout: number
}

export const fetchUtxos = async (chain: Chain = 'mvc', address: string): Promise<any[]> => {
  if (chain === 'mvc') {
    return (await fetchMVCUtxos(address)) || []
  } else {
    return (await getBtcUtxos(address)) || []
  }
}

export enum AddressType {
  P2PKH,
  P2WPKH,
  P2TR,
  P2SH_P2WPKH,
  M44_P2WPKH,
  M44_P2TR,
}

export interface UnisatUTXO {
  txId: string
  outputIndex: number
  satoshis: number
  scriptPk: string
  addressType: AddressType
  inscriptions: {
    id: string
    num: number
    offset: number
  }[]
}

export async function getBtcUtxos(address: string): Promise<UTXO[]> {
  const net = getNet()
  return metaletApiV3<UTXO[]>('/address/btc-utxo').get({ net, address, unconfirmed: '1' })
}

// export async function getInscriptionUtxos(inscriptions: Inscription[]): Promise<UTXO[]> {
//   const unisatUtxos = await unisatApi<UnisatUTXO[]>('/inscription/utxos').post({
//     inscriptionIds: inscriptions.map((inscription) => inscription.inscriptionId),
//   })
//   const utxos = unisatUtxos.map((utxo) => {
//     const inscriptionIds = utxo.inscriptions.map((inscription) => inscription.id)
//     const inscription = inscriptions.find((inscription) => inscriptionIds.includes(inscription.inscriptionId))!
//     return { ...utxo, confirmed: !!inscription.utxoConfirmation }
//   })
//   return utxos.map((utxo) => formatUnisatUTXO(utxo))
// }

export async function getInscriptionUtxo(inscriptionId: string): Promise<UTXO> {
  const net = getNet()
  return await metaletApiV3<UTXO>('/inscription/utxo').get({ net, inscriptionId })
}

export interface MempoolUtxo {
  txid: string
  vout: number
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
    block_time?: number
  }
  value: number
}

function formatMempoolUTXO(utxo: MempoolUtxo): UTXO {
  return {
    txId: utxo.txid,
    outputIndex: utxo.vout,
    satoshis: utxo.value,
    confirmed: utxo.status.confirmed,
    inscriptions: [],
  }
}

export async function getUtxos(address: string): Promise<UTXO[]> {
  const utxos = await mempoolApi<MempoolUtxo[]>(`/address/${address}/utxo`).get()
  return utxos.map((utxo) => formatMempoolUTXO(utxo))
}

export const useMVCUTXOQuery = (address: Ref<string>, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['MVCUTXOs', { address }],
    queryFn: () => fetchMVCUtxos(address.value),
    ...options,
  })
}
