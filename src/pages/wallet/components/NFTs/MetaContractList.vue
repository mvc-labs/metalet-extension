<script setup lang="ts">
import NFTItem from './NFTItem.vue'
import { useRouter } from 'vue-router'
import { getAddress } from '@/lib/account'
import { ref, computed, watch } from 'vue'
import { useMetacontractCountQuery, useMetacontractsQuery } from '@/queries/nfts'

const flag = ref('')
const address = ref()
const cursorRef = ref(0)
const router = useRouter()

getAddress('mvc').then((_address) => {
  address.value = _address
})

const { isLoading, data: metaContracts } = useMetacontractsQuery({address}, {
  enabled: computed(() => !!address.value),
})

const nftItems = computed(() => {
  if (!metaContracts.value) {
    return
  }
  return metaContracts.value.map((metaContract) => {
    return {
      id: metaContract.txId,
      metaTxId: metaContract.metaTxId,
      tokenIndex: metaContract.tokenIndex,
      title: metaContract.name,
      desc: metaContract.seriesName,
      codehash: metaContract.codeHash,
      genesis: metaContract.genesis,
      metaOutputIndex: 0,
      imgUrl:
        'https://metalet.space/metafile/compress/' +
        metaContract.icon.substring(metaContract.icon.lastIndexOf('://') + 3, metaContract.icon.lastIndexOf('.')),
    }
  })
})

const loadBRCInscriptions = () => {
  cursorRef.value = cursorRef.value + 1
}

const toNftDetail = (nft: any) => {
  router.push(
    `/nfts/${nft.codehash}/${nft.genesis}/${nft.tokenIndex}?meta_txid=${nft.metaTxId}&meta_output_index=${nft.metaOutputIndex}`
  )
}
</script>

<template>
  <div v-if="isLoading" class="w-full py-24 text-center text-sm font-bold text-gray-500">Metacontracts loading...</div>
  <div v-else-if="nftItems?.length">
    <div class="py-4 grid grid-cols-3 gap-x-1 gap-y-4">
      <NFTItem v-for="nftItem in nftItems" :key="nftItem.id" :nftItem="nftItem" @click="toNftDetail(nftItem)" />
    </div>
    <div
      v-if="false"
      @click="loadBRCInscriptions"
      class="text-center text-gray-primary hover:underline cursor-pointer hover:text-blue-500"
    >
      Load more MetaContracts
    </div>
  </div>
  <div v-else class="w-full py-24 text-center text-sm font-bold text-gray-500">No Metacontracts yet.</div>
</template>

<style lang="less" scoped></style>
