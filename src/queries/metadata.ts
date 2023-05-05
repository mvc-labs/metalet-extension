import { ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { parseCollectionInfo, parseNftInfo } from '../lib/metadata'

export const useCollectionInfoQuery = (
  txid: string,
  outputIndex: number,
  options?: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['metadata', { txid, outputIndex, type: 'collectionInfo' }],
    queryFn: () => parseCollectionInfo(txid, outputIndex),
    select: (metaData) => {
      return metaData
    },
    ...options,
    staleTime: 1000 * 60 * 60 * 24 * 30,
  })
}

export const useNftInfoQuery = (txid: string, outputIndex: number, options?: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['metadata', { txid, outputIndex, type: 'nftInfo' }],
    queryFn: () => parseNftInfo(txid, outputIndex),
    select: (metaData) => {
      return metaData
    },
    ...options,
    staleTime: 1000 * 60 * 60 * 24 * 30,
  })
}
