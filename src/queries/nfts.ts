import { getNet } from '@/lib/network'
import { ComputedRef, Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { metaletApiV3, mvcApi } from './request'
import { bannedCollections } from '../data/nfts'

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
  const nftCollections: any = await mvcApi(`/contract/nft/address/${address}/summary`).get()

  return nftCollections
    .filter((nftCollection: any) => {
      // only accept new contract nft（codehash: e205939ad9956673ce7da9fbd40514b30f66dc35）
      return nftCollection.codeHash === 'e205939ad9956673ce7da9fbd40514b30f66dc35'
    })
    .filter((collection: any) => {
      // filter banned collections
      return bannedCollections.every((bannedCollectionGenesis) => {
        return collection.genesis !== bannedCollectionGenesis
      })
    })
    .map((nftCollection: any) => {
      // codeHash to lowercase
      nftCollection.codehash = nftCollection.codeHash
      delete nftCollection.codeHash
      return nftCollection
    })
}

export const fetchOneNftCollection = async (codehash: string, genesis: string): Promise<NftCollection> => {
  const nftCollection: any = await mvcApi(`/contract/nft/genesis/${codehash}/${genesis}/summary`).get()

  // codeHash to lowercase
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
  const nfts: any = await mvcApi(path).get()

  return nfts.map((nft: any) => {
    // codeHash to codehash
    nft.codehash = nft.codeHash
    delete nft.codeHash
    return nft
  })
}

export const fetchOneNft = async (params: { codehash: string; genesis: string; tokenIndex: number }): Promise<Nft> => {
  let path = `/contract/nft/genesis/${params.codehash}/${params.genesis}/utxo?tokenIndex=${params.tokenIndex}`

  const nft: any = await mvcApi(path)
    .get()
    .then((nfts: any) => nfts[0])
  // codeHash to codehash
  nft.codehash = nft.codeHash
  delete nft.codeHash

  return nft
}

export const useNftCollectionsQuery = (address: Ref, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['nftCollections', { address: address.value }],
    queryFn: () => fetchNftCollections(address.value),
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

export const useOneNftQuery = (params: { codehash: string; genesis: string; tokenIndex: number }) => {
  return useQuery({
    queryKey: ['nft', { ...params }],
    queryFn: () => fetchOneNft(params),
  })
}

export interface MetaIDPin {
  "id": string,
  "number": number,
  "rootTxId": string,
  "address": string,
  "output": string,
  "outputValue": number,
  "timestamp": number,
  "genesisFee": number,
  "genesisHeight": number,
  "genesisTransaction": string,
  "txInIndex": number,
  "txInOffset": number,
  "operation": string,
  "path": string,
  "parentPath": string,
  "encryption": string,
  "version": string,
  "contentType": string,
  "contentBody": string,
  "contentLength": number,
  "contentSummary": string
}

export async function getMetaPins(
  address: string,
  cursor = 0,
  size = 10
): Promise<MetaIDPin[]> {
  const net = getNet()
  return await metaletApiV3<MetaIDPin[]>('/address/pins').get({
    // net: 'testnet',
    // address: "tb1qlwvue3swm044hqf7s3ww8um2tuh0ncx65a6yme",
    net,
    address,
    cursor: `${cursor}`,
    size: `${size}`,
  })
}

export const useMetaPinsQuery = (
  address: Ref<string>,
  cursor: Ref<number>,
  size: Ref<number>,
  options: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['MetaPins', { address: address.value, cursor: cursor.value, size: size.value }],
    queryFn: () => getMetaPins(address.value, cursor.value, size.value),
    ...options,
  })
}

export default useNftsQuery
