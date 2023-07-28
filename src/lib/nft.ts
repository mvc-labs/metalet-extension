import nfts from '../data/nfts'

export function isOfficialNft(genesis: string) {
  return nfts.some((nft) => nft.genesis === genesis)
}
