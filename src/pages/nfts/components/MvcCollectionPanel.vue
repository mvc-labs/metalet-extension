<script lang="ts" setup>
import { Ref, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDownLeftIcon } from '@heroicons/vue/20/solid'

import { getAddress } from '../../../lib/account'
import { useNftCollectionsQuery } from '../../../queries/nfts'

import NftCollectionItem from './CollectionItem.vue'

const router = useRouter()

const address: Ref<string> = ref('')
getAddress().then((add) => {
  if (!add) return router.push('/welcome')

  address.value = add
})
const enabled = computed(() => !!address.value)

const { isLoading, data: nftCollections } = useNftCollectionsQuery(address, { enabled })

const nftsCountDisplay = computed(() => {
  if (!nftCollections.value) return '--'

  const nftsCount = nftCollections.value.reduce((acc, cur) => {
    return acc + cur.count
  }, 0)

  return `${nftsCount} items`
})

const toReceive = () => {
  router.push(`/wallet/receive?chain=mvc`)
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-1">
      <div class="text-sm text-gray-500">collectables</div>
      <div class="text-xl font-bold">{{ nftsCountDisplay }}</div>
    </div>

    <div class="">
      <button class="secondary-btn flex w-full items-center justify-center gap-x-1 py-3" @click="toReceive">
        <ArrowDownLeftIcon class="h-4 w-4" />
        <span>Receive</span>
      </button>
    </div>

    <div class="!my-8 text-sm" v-if="isLoading">...</div>
    <div class="!my-8 space-y-8 text-sm" v-else>
      <NftCollectionItem v-for="collection in nftCollections" :collection="collection" />
    </div>
  </div>
</template>
