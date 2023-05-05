<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useOneNftCollectionQuery } from '../../queries/nfts'
import { useCollectionInfoQuery } from '../../queries/metadata'

const route = useRoute()
const { codehash, genesis } = route.params as {
  codehash: string
  genesis: string
}
const { meta_txid: txid, meta_output_index: outputIndex } = route.query as {
  meta_txid: string
  meta_output_index: string
}

const { isLoading: isLoadingCollection, data: collection } = useOneNftCollectionQuery(codehash, genesis)

const { isLoading: isLoadingCollectionInfo, data: collectionInfo } = useCollectionInfoQuery(txid, Number(outputIndex))
</script>

<template>
  <!-- Info -->
  <div class="my-4 border-b border-gray-100 pb-4 text-sm" v-if="collectionInfo">
    <h3 class="gradient-text text-xl font-bold">{{ collectionInfo.name }}</h3>
    <div class="text-gray-500">Total Supply: {{ collectionInfo.totalSupply }}</div>
    <div class="mt-4 text-xs">{{ collectionInfo.description }}</div>
  </div>

  <!-- list -->
</template>
