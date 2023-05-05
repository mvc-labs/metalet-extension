<script lang="ts" setup>
import { computed } from 'vue'
import { useNftInfoQuery } from '../../../queries/metadata'
import type { Nft } from '../../../queries/nfts'

const props = defineProps<{
  nft: Nft
}>()

const { data: nftInfo } = useNftInfoQuery(props.nft.metaTxid, props.nft.metaOutputIndex)

const hasMetafilePath = computed(() => {
  return nftInfo.value?.icon
})

// const { data: icon } = useMetafileQuery(
//   props.nft.metaTxid,
//   props.nft.metaOutputIndex,
//   hasMetafilePath.value ? nftInfo.value?.icon : ''
//   {
//     enabled: hasMetafilePath,
//   }
// )
</script>

<template>
  <div class="flex flex-col gap-y-2">
    <div class="aspect-square rounded-lg bg-gray-300" v-if="nftInfo?.icon"></div>
    <div class="aspect-square rounded-lg bg-gray-100" v-else></div>
    <div class="text-center text-sm text-gray-300">{{ nft.tokenIndex }}</div>
  </div>
</template>
