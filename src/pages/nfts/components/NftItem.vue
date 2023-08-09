<script lang="ts" setup>
import { computed } from 'vue'
import { useNftInfoQuery } from '@/queries/metadata'
import { parseMetaFile, getResizeQuery } from '@/lib/metadata'
import type { Nft, NftCollection } from '@/queries/nfts'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  nft: Nft
  collectionMetaInfo: {
    metaTxid: string
    metaOutputIndex: number
  }
}>()

const { data: nftInfo } = useNftInfoQuery(
  computed(() => props.nft.metaTxid),
  computed(() => props.nft.metaOutputIndex)
)

const iconUrl = computed(() => {
  if (!nftInfo.value || !nftInfo.value.icon) return null

  return parseMetaFile(nftInfo.value.icon) + getResizeQuery(100)
})

const toNftDetail = () => {
  router.push(
    `/nfts/${props.nft.codehash}/${props.nft.genesis}/${props.nft.tokenIndex}?meta_txid=${props.collectionMetaInfo.metaTxid}&meta_output_index=${props.collectionMetaInfo.metaOutputIndex}`
  )
}
</script>

<template>
  <div class="flex cursor-pointer flex-col" @click="toNftDetail">
    <img :src="iconUrl" class="aspect-square h-full w-full rounded-lg bg-gray-200 object-contain" v-if="iconUrl" />

    <div
      class="flex aspect-square items-center justify-center rounded-lg bg-gray-200 text-lg font-bold italic text-gray-400"
      v-else
    >
      NFT
    </div>

    <div class="mt-1 text-center text-xs text-gray-400">{{ '# ' + nft.tokenIndex }}</div>
    <div class="shrink-0 truncate text-center text-xs text-gray-500" v-if="nftInfo">{{ nftInfo.name }}</div>
  </div>
</template>
