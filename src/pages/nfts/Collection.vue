<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'

import useNftsQuery, { useOneNftCollectionQuery } from '@/queries/nfts'
import { useCollectionInfoQuery } from '@/queries/metadata'
import { getAddress } from '@/lib/account'

import NftItem from './components/NftItem.vue'

const address = ref<string>('')
getAddress('mvc').then((add) => (address.value = add!))

const route = useRoute()
const { codehash, genesis } = route.params as {
  codehash: string
  genesis: string
}
const { meta_txid: txid, meta_output_index: outputIndex } = route.query as {
  meta_txid: string
  meta_output_index: string
}
const { isLoading: isLoadingCollectionInfo, data: collectionInfo } = useCollectionInfoQuery(txid, Number(outputIndex))

const { isLoading, data: nfts } = useNftsQuery(
  address,
  {
    codehash,
    genesis,
    limit: 10,
  },
  {
    enabled: computed(() => !!address.value),
  }
)
</script>

<template>
  <!-- Info -->
  <div class="my-4 border-b border-gray-100 pb-4 text-sm" v-if="collectionInfo">
    <h3 class="gradient-text text-xl font-bold">{{ collectionInfo.name }}</h3>
    <div class="text-gray-500">Total Supply: {{ collectionInfo.totalSupply }}</div>
    <div class="mt-4 text-xs">{{ collectionInfo.description }}</div>
  </div>

  <!-- list -->
  <div class="grid grid-cols-3 gap-x-2">
    <NftItem
      v-for="nft in nfts"
      :nft="nft"
      :collection-meta-info="{
        metaTxid: txid,
        metaOutputIndex: Number(outputIndex),
      }"
    />
  </div>
</template>
