import { reactive, watch } from 'vue'

interface NFTType {
  id: number
  name: string
  disabled: boolean
}

const nfts: NFTType[] = [
  { id: 1, name: 'Ordinals', disabled: false },
  // { id: 2, name: 'Atomicals', disabled: true },
  { id: 3, name: 'MetaContract', disabled: false },
  { id: 4, name: 'MetaID Pin', disabled: false },
]

interface NftStore {
  nfts: NFTType[]
  selectedNFT: NFTType
}

export const nftStore = reactive<NftStore>({
  nfts,
  selectedNFT: nfts[0],
})
