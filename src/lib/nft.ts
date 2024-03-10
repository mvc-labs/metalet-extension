import nfts from '../data/nfts'
import useStorage from './storage'

export type NFTType = 'BTC Oridinals' | 'MetaContract' | 'MetaPin'

const NFTType_Key = 'NFTType'

const storage = useStorage()

export function isOfficialNft(genesis: string) {
  return nfts.some((nft) => nft.genesis === genesis)
}

export function getNftType() {
  return storage.get<NFTType>(NFTType_Key, { defaultValue: 'MetaContract' })
}

export function setNftType(nftType: NFTType) {
  return storage.set(NFTType_Key, nftType)
}
