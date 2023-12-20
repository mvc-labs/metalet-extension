<script setup lang="ts">
import { ref, computed } from 'vue'
import BRCToken from './BRCToken.vue'
import { useRouter } from 'vue-router'
import { getAddress } from '@/lib/account'
import { Inscription, useBRCInscriptionsQuery } from '@/queries/inscribe'
import dayjs from 'dayjs'

const addressRef = ref('')
const cursorRef = ref(0)
const sizeRef = ref(10)
const router = useRouter()

getAddress('btc').then((address) => {
  addressRef.value = address
})
const { isLoading, data: inscriptionsData } = useBRCInscriptionsQuery(addressRef, cursorRef, sizeRef, {
  enabled: computed(() => !!addressRef.value),
})

const toBRC20Detail = (inscription: Inscription) => {
  const query = {
    inscriptionId: inscription.inscriptionId,
    inscriptionNumber: inscription.inscriptionNumber,
    timestamp: inscription.timestamp * 1000,
    outputValue: inscription.outputValue,
    preview: inscription.preview,
    content: inscription.content,
    genesisTransaction: inscription.genesisTransaction,
    contentLength: inscription.contentLength,
    contentType: inscription.contentType,
  }
  router.push({
    name: 'brc20Detail',
    query,
  })
}
</script>

<template>
  <div v-if="isLoading">BRC Token List loading...</div>
  <div v-else-if="inscriptionsData && inscriptionsData.total" class="mt-12 px-3 py-4 grid grid-cols-3 gap-x-1 gap-y-7">
    <div
      v-for="inscription in inscriptionsData.list"
      @click="toBRC20Detail(inscription)"
      class="flex flex-col items-center justify-center rounded-md cursor-pointer text-[#999999]"
    >
      <BRCToken :ordinalsUrl="inscription.content" :value="inscription.outputValue" />
      <span class="text-sm mt-3 truncate" :title="'# ' + inscription.inscriptionNumber"
        ># {{ inscription.inscriptionNumber }}</span
      >
      <span class="text-xs mt-1 h-[30px]">{{
        inscription.timestamp === 0 ? 'Uncomfirmed' : dayjs(inscription.timestamp * 1000).format('YYYY/MM/DD HH:mm:ss')
      }}</span>
    </div>
  </div>
  <div v-else class="w-full py-3 text-center text-sm font-bold text-gray-500">No BRC Tokens yet</div>
</template>

<style lang="less" scoped></style>
