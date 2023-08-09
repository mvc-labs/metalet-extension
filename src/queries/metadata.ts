import { ComputedRef, Ref } from 'vue'
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
    ...options,
    staleTime: 1000 * 60 * 60 * 24 * 30,
  })
}

export const useNftInfoQuery = (
  txid: Ref<string> | ComputedRef<string>,
  outputIndex: Ref<number> | ComputedRef<number>,
  options?: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['metadata', { txid, outputIndex, type: 'nftInfo' }],
    queryFn: () => parseNftInfo(txid.value, outputIndex.value),
    select: (nftInfo) => {
      return nftInfo
    },
    ...options,
    staleTime: 1000 * 60 * 60 * 24 * 30,
  })
}
