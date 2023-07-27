<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useOneNftQuery } from '../../queries/nfts'
import { useNftInfoQuery } from '../../queries/metadata'
import { ComputedRef, computed } from 'vue'
import { parseMetaFile, getResizeQuery } from '../../lib/metadata'

const router = useRouter()
const { codehash, genesis, tokenIndex } = defineProps<{
  codehash: string
  genesis: string
  tokenIndex: number
}>()

const { isLoading: isLoadingNft, data: nft } = useOneNftQuery({
  codehash,
  genesis,
  tokenIndex,
})

const enabled = computed(() => !!nft.value?.metaTxid)

const metaTxid = computed(() => nft.value?.metaTxid) as ComputedRef<string>
const metaOutputIndex = computed(() => nft.value?.metaOutputIndex) as ComputedRef<number>
const { isLoading: isLoadingNftInfo, data: nftInfo } = useNftInfoQuery(metaTxid, metaOutputIndex, {
  enabled,
})

const coverUrl = computed(() => {
  if (!nftInfo.value || !nftInfo.value.icon) return null

  return parseMetaFile(nftInfo.value.icon) + getResizeQuery(500)
})

const toTransferNft = () => {
  router.push(`/nfts/transfer-nft/${codehash}/${genesis}/${tokenIndex}`)
}
</script>

<template>
  <div class="" v-if="isLoadingNftInfo">Loading</div>
  <div class="" v-else-if="nftInfo && nft">
    <!-- image -->
    <div class="mx-auto aspect-square w-3/4 overflow-hidden rounded-lg">
      <img :src="coverUrl" class="object-cover" v-if="coverUrl" />
    </div>

    <!-- info -->
    <div class="mt-8">
      <div class="text-lg font-bold">{{ nftInfo.name }}</div>
      <div class="text-sm text-gray-500">{{ '# ' + nft.tokenIndex }}</div>
    </div>

    <!-- control -->
    <div class="mt-8">
      <button class="main-btn-bg w-full rounded-md py-3 text-center text-base text-white" @click="toTransferNft">
        Transfer
      </button>
    </div>
  </div>
</template>
