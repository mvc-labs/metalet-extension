<script lang="ts" setup>
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import { useRouter } from 'vue-router'

import { NftCollection, useNftsQuery } from '@/queries/nfts'
import { useCollectionInfoQuery } from '@/queries/metadata'
import { address } from '@/lib/account'

import NftItem from './NftItem.vue'

const props = defineProps<{
  collection: NftCollection
}>()
const router = useRouter()

const { isLoading, data: nfts } = useNftsQuery(address, {
  codehash: props.collection.codehash,
  genesis: props.collection.genesis,
  limit: 3,
})

const { data: collectionInfo } = useCollectionInfoQuery(props.collection.metaTxid, props.collection.metaOutputIndex)

const toCollection = () => {
  router.push(
    `/collections/${props.collection.codehash}/${props.collection.genesis}?meta_txid=${props.collection.metaTxid}&meta_output_index=${props.collection.metaOutputIndex}`
  )
}
</script>

<template>
  <div class="space-y-4">
    <!-- title -->
    <div class="flex cursor-pointer items-center justify-between" @click="toCollection">
      <div class="font-bold" v-if="collectionInfo?.name">{{ collectionInfo.name }}</div>
      <div class="font-bold text-gray-700" v-else>{{ collection.genesis.slice(0, 8) + '...' }}</div>
      <div class="flex items-center gap-x-1">
        <span class="text-gray-500">{{ collection.count }}</span>
        <ChevronRightIcon class="h-4 w-4" />
      </div>
    </div>

    <!-- list -->
    <div class="grid grid-cols-3 gap-x-2">
      <NftItem v-for="nft in nfts" :nft="nft" />
    </div>
  </div>
</template>
