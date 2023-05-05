import { useQuery } from '@tanstack/vue-query'
import { metasvApi } from './request'
import { ComputedRef, Ref } from 'vue'

export type NftCollection = {
  codehash: string
  genesis: string
  metaTxid: string
  metaOutputIndex: number
  tokenSupply: string
  count: number
}

export type Nft = {
  address: string
  txid: string
  txIndex: number
  codehash: string
  genesis: string
  metaTxid: string
  metaOutputIndex: number
  tokenSupply: number
  tokenIndex: number
  flag: string
}

export const fetchNftCollections = async (address: string): Promise<NftCollection[]> => {
  const nftCollections: any = await metasvApi(`/contract/nft/address/${address}/summary`).get()

  return nftCollections
    .filter((nftCollection: any) => {
      // 只接受新合约的nft（codehash为 e205939ad9956673ce7da9fbd40514b30f66dc35）
      return nftCollection.codeHash === 'e205939ad9956673ce7da9fbd40514b30f66dc35'
    })
    .map((nftCollection: any) => {
      // 将codeHash改为小写
      nftCollection.codehash = nftCollection.codeHash
      delete nftCollection.codeHash
      return nftCollection
    })
}

export const fetchOneNftCollection = async (codehash: string, genesis: string): Promise<NftCollection> => {
  const nftCollection: any = await metasvApi(`/contract/nft/genesis/${codehash}/${genesis}/summary`).get()

  // 将codeHash改为小写
  nftCollection.codehash = nftCollection.codeHash
  delete nftCollection.codeHash

  return nftCollection
}

export const fetchNfts = async (
  address: string,
  params?: {
    codehash: string
    genesis: string
    limit?: number
  }
): Promise<Nft[]> => {
  let path = `/contract/nft/address/${address}/utxo`
  if (params) {
    path += `?codeHash=${params.codehash}&genesis=${params.genesis}`
  }
  if (params?.limit) {
    path += `&limit=${params.limit}`
  }
  const nfts: any = await metasvApi(path).get()

  return nfts.map((nft: any) => {
    // 将codeHash改为小写
    nft.codehash = nft.codeHash
    delete nft.codeHash
    return nft
  })
}

export const useNftCollectionsQuery = (address: Ref, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['nftCollections', { address: address.value }],
    queryFn: () => fetchNftCollections(address.value),
    select: (data: NftCollection[]) => {
      const collections = data.map((nftCollection) => {
        return {
          ...nftCollection,
        }
      })

      return collections
    },
    ...options,
  })
}

export const useOneNftCollectionQuery = (
  codehash: string,
  genesis: string,
  options?: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['nftCollections', { codehash, genesis }],
    queryFn: () => fetchOneNftCollection(codehash, genesis),
    ...options,
  })
}

export const useNftsQuery = (
  address: Ref,
  params?: {
    codehash: string
    genesis: string
    limit?: number
  },
  options?: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['nfts', { address: address.value, ...params }],
    queryFn: () => fetchNfts(address.value, params),
    select: (data: Nft[]) => {
      return data.map((nft) => {
        return {
          ...nft,
        }
      })
    },
    ...options,
  })
}

// export const useNftQuery = (address: Ref, symbol: string, options: { enabled: ComputedRef<boolean> }) => {
//   return useQuery({
//     queryKey: ['nfts', { address: address.value }],
//     queryFn: () => fetchNfts(address.value),
//     select: (data: Nft[]) => {
//       const nft = data.find((nft) => nft.symbol === symbol) as Nft

//       return {
//         ...nft,
//       }
//     },
//     ...options,
//   })
// }

export default useNftsQuery
