import { Buffer } from 'buffer'
import { getNet } from '@/lib/network'
import { Ref, ComputedRef } from 'vue'
import { metaletApiV3 } from './request'
import { useQuery, useInfiniteQuery } from '@tanstack/vue-query'

export interface PreInscribe {
  count: number
  fee: number
  inscriptionState: number
  minerFee: number
  needAmount: number
  networkFeeRate: number
  orderId: string
  payAddress: string
  payAmount: number
  receiveAddress: string
  serviceFee: number
}

export const preInscribe = async (receiveAddress: string, feeRate: number, filename: string): Promise<PreInscribe> => {
  const net = getNet()
  return await metaletApiV3<PreInscribe>(`/inscribe/pre`).post({
    feeRate,
    files: [
      {
        filename,
        dataURL: Buffer.from(filename).toString('base64'),
      },
    ],
    net,
    receiveAddress,
  })
}

export interface InscriptionInfo {
  inscriptionId: string
  inscriptionNum: number
  confirmed: boolean
}

export interface CommitInscribe {
  commitTxHash: string
  inscriptionIdList: string[]
  inscriptionState: number
  orderId: string
  revealTxHashList: string[]
  inscriptionInfos: InscriptionInfo[]
}

export const commitInscribe = async (
  address: string,
  orderId: string,
  rawTx: string
): Promise<CommitInscribe | void> => {
  const net = getNet()
  return await metaletApiV3<CommitInscribe>(`/inscribe/commit`).post({
    feeAddress: address,
    net,
    orderId,
    rawTx,
    version: 0,
  })
}

export const getInscribeInfo = async (orderId: string): Promise<CommitInscribe> => {
  return await metaletApiV3<CommitInscribe>(`/inscribe/info`).get({
    orderId,
  })
}

export const useInscribeInfoQuery = (orderId: Ref<string>, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['inscribeInfo', { orderId: orderId.value }],
    queryFn: () => getInscribeInfo(orderId.value),
    ...options,
  })
}

export interface Inscription {
  inscriptionId: string
  inscriptionNumber: number
  address: string
  outputValue: number
  preview: string
  content: string
  contentType: string
  contentLength: number
  timestamp: number
  genesisTransaction: string
  location: string
  output: string
  offset: number
  contentBody: string
  utxoHeight: number
  utxoConfirmation: number
}

export async function getBRCInscriptions(
  address: string,
  cursor = 0,
  size = 10
): Promise<{ list: Inscription[]; total: number }> {
  const net = getNet()
  return await metaletApiV3<{ list: Inscription[]; total: number }>('/address/inscriptions').get({
    net,
    address,
    cursor: `${cursor}`,
    size: `${size}`,
  })
}

export async function fetchCInscriptions(
  address: string,
  cursor: number,
  size: number
): Promise<{ list: Inscription[]; nextCursor: number | null }> {
  const net = getNet()
  const { list, total } = await metaletApiV3<{ list: Inscription[]; total: number }>('/address/inscriptions').get({
    net,
    address,
    cursor: `${cursor}`,
    size: `${size}`,
  })

  cursor += size

  return {
    list,
    nextCursor: cursor > total ? null : cursor,
  }
}

export async function getBRCInscriptionInfo(inscriptionId: string): Promise<Inscription> {
  const net = getNet()
  const {
    inscriptions: [inscription],
  } = await metaletApiV3<{ inscriptions: Inscription[] }>('/inscription/utxo').get({
    net,
    inscriptionId,
  })
  return inscription
}

export const useInscriptionsInfiniteQuery = (
  address: Ref<string>,
  size: Ref<number>,
  options: { enabled: ComputedRef<boolean> }
) => {
  return useInfiniteQuery(
    ['Inscriptions', { address, size }],
    ({ pageParam: cursor = 0 }) => fetchCInscriptions(address.value, cursor, size.value),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      ...options,
    }
  )
}

export const useBRCInscriptionsQuery = (
  address: Ref<string>,
  page: Ref<number>,
  size: Ref<number>,
  options: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['BRCInscriptions', { address, page, size }],
    queryFn: () => getBRCInscriptions(address.value, size.value * page.value, size.value),
    ...options,
  })
}

export const useBRCInscriptionInfoQuery = (inscriptionId: Ref<string>, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['BRCInscriptionInfo', { inscriptionId }],
    queryFn: () => getBRCInscriptionInfo(inscriptionId.value),
    ...options,
  })
}
