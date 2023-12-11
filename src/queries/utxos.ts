import { Chain } from '@/lib/account'
import { mvcApi, metaletApiV2, unisatApi, mempoolApi, metaletApiV3 } from './request'

export interface UTXO {
  txId: string
  vout: number
  satoshi: number
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
  return await mvcApi(`/address/${address}/utxo`).get()
}

// Fetch BTC address non inscription UTXO utxos
// const fetchBTCUtxos = async (address: string): Promise<UTXO[]> => {
//   const {
//     data: { utxo },
//   } = await metaletApiV2(`/address/utxos`).get({
//     address,
//     chain: 'btc',
//   })

//   return utxo
// }

export type Utxo = {
  addressType: number
  outputIndex: number
  satoshis: number
  satoshi: number
  txid: string
  txId: string
  vout: number
}

// export async function fetchBtcUtxos(address: string): Promise<Utxo[]> {
//   const utxos = await metaletApiV2('/address/utxos')
//     .get({ address, chain: 'btc' })
//     .then((res) => res.data?.utxo || [])
//   return utxos
// }

export const fetchUtxos = async (chain: Chain = 'mvc', address: string): Promise<any[]> => {
  if (chain === 'mvc') {
    return await fetchMVCUtxos(address)
  } else {
    return await getBtcUtxos(address)
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

function formatUnisatUTXO(utxo: UnisatUTXO & { confirmed: boolean }): UTXO {
  return {
    txId: utxo.txId,
    vout: utxo.outputIndex,
    satoshi: utxo.satoshis,
    confirmed: utxo.confirmed,
    inscriptions: utxo.inscriptions.map(({ id, num }) => ({ id, num })),
  }
}

export async function getBtcUtxos(address: string): Promise<UTXO[]> {
  return metaletApiV3<UTXO[]>('/address/btc-utxo').get({ address })
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

export async function getInscriptionUtxo(inscriptionId: string, confirmed = false): Promise<UTXO> {
  const utxo = await unisatApi<UnisatUTXO>('/inscription/utxo').get({ inscriptionId })
  return formatUnisatUTXO({ ...utxo, confirmed })
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
    vout: utxo.vout,
    satoshi: utxo.value,
    confirmed: utxo.status.confirmed,
    inscriptions: [],
  }
}

export async function getUtxos(address: string): Promise<UTXO[]> {
  const utxos = await mempoolApi<MempoolUtxo[]>(`/address/${address}/utxo`).get()
  return utxos.map((utxo) => formatMempoolUTXO(utxo))
}
