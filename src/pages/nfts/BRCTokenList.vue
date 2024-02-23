<script setup lang="ts">
import { ref, computed } from 'vue'
import BRCToken from './BRCToken.vue'
import { useRouter } from 'vue-router'
import { getAddress } from '@/lib/account'
import { Inscription, useBRCInscriptionsQuery } from '@/queries/inscribe'
import dayjs from 'dayjs'

const addressRef = ref()
const cursorRef = ref(0)
const sizeRef = ref(10)
const router = useRouter()

getAddress('btc').then((address) => {
  addressRef.value = address
})

const { isLoading, data: inscriptionsData } = useBRCInscriptionsQuery(addressRef, cursorRef, sizeRef, {
  enabled: computed(() => !!addressRef.value),
})

const inscriptionsCountDisplay = computed(() => {
  if (!inscriptionsData.value) return '--'
  return `${inscriptionsData.value.list.length} items`
})

const toReceive = () => {
  router.push(`/wallet/receive?chain=btc`)
}

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
  <div class="space-y-4">
    <div class="space-y-1" v-if="false">
      <div class="text-sm text-gray-500">NUMBER OF COLLECTIBLES</div>
      <div class="text-xl font-bold">{{ inscriptionsCountDisplay }}</div>
    </div>

    <div v-if="false">
      <button class="secondary-btn flex w-full items-center justify-center gap-x-1 py-3" @click="toReceive">
        <ArrowDownLeftIcon class="h-4 w-4" />
        <span>Receive</span>
      </button>
    </div>

    <div v-if="isLoading" class="w-full py-3 text-center text-sm font-bold text-gray-500">
      BRC Token List loading...
    </div>
    <div
      v-else-if="inscriptionsData && inscriptionsData.total"
      class="mt-12 px-3 py-4 grid grid-cols-3 gap-x-1 gap-y-7"
    >
      <div
        v-for="inscription in inscriptionsData.list"
        @click="toBRC20Detail(inscription)"
        class="flex flex-col items-center justify-center rounded-md cursor-pointer text-[#999999]"
      >
        <BRCToken :value="inscription.outputValue" :contentBody="inscription.contentBody" />
        <span class="text-sm text-center mt-3 truncate" :title="'# ' + inscription.inscriptionNumber">{{
          inscription.utxoHeight === 0 ? 'Uncomfirmed' : `# ${inscription.inscriptionNumber}`
        }}</span>
        <span class="text-xs text-center mt-1 h-[30px]">{{
          dayjs(inscription.timestamp * 1000).format('YYYY/MM/DD HH:mm:ss')
        }}</span>
      </div>
    </div>
    <div v-else class="w-full py-3 text-center text-sm font-bold text-gray-500">No Ordinals yet.</div>
  </div>
</template>

<style lang="less" scoped></style>
