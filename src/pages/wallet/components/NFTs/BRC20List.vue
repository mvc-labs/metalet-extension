<script setup lang="ts">
import NFTItem from './NFTItem.vue'
import { useRouter } from 'vue-router'
import { getAddress } from '@/lib/account'
import { ref, computed, watch } from 'vue'
import { type Inscription, useBRCInscriptionsQuery } from '@/queries/inscribe'

const address = ref()
const cursor = ref(0)
const router = useRouter()
const inscriptions = ref<Inscription[]>([])

getAddress('btc').then((_address) => {
  address.value = _address
})

const { isLoading, data: inscriptionsData } = useBRCInscriptionsQuery(address, cursor, ref(10), {
  enabled: computed(() => !!address.value),
})

watch(inscriptionsData, () => {
  if (inscriptionsData.value) {
    inscriptions.value.push(...inscriptionsData.value.list)
  }
})

const nftItems = computed(() => {
  return inscriptions.value.map((inscription) => {
    return {
      id: inscription.inscriptionId,
      title: `#${inscription.inscriptionNumber}`,
      desc: 'BTC Odinals',
      content: inscription.contentBody,
    }
  })
})

const loadBRCInscriptions = () => {
  cursor.value = cursor.value + 1
}

const toBRC20Detail = (inscriptionId: string) => {
  router.push({
    name: 'brc20Detail',
    params: {
      address: address.value,
      inscriptionId,
    },
  })
}
</script>

<template>
  <div v-if="isLoading" class="w-full py-24 text-center text-sm font-bold text-gray-500">BRC20 Tokens loading...</div>
  <div v-else-if="nftItems.length">
    <div class="py-4 grid grid-cols-3 gap-x-1 gap-y-4">
      <NFTItem v-for="nftItem in nftItems" :key="nftItem.id" :nftItem="nftItem" @click="toBRC20Detail(nftItem.id)" />
    </div>
    <div
      @click="loadBRCInscriptions"
      v-if="inscriptionsData && inscriptionsData.total > inscriptions.length"
      class="text-center text-gray-primary hover:underline cursor-pointer hover:text-blue-500 text-xs"
    >
      Load more Ordinals
    </div>
  </div>
  <div v-else class="w-full py-24 text-center text-sm font-bold text-gray-500">No Ordinals yet.</div>
</template>
