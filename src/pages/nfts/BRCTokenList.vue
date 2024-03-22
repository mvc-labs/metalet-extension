<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, computed, watch } from 'vue'
import BRCToken from './BRCToken.vue'
import { useRouter } from 'vue-router'
import { getAddress } from '@/lib/account'
import { ArrowDownLeftIcon } from '@heroicons/vue/20/solid'
import { type Inscription, useBRCInscriptionsQuery } from '@/queries/inscribe'

const sizeRef = ref(10)
const addressRef = ref()
const cursorRef = ref(0)
const router = useRouter()
const inscriptions = ref<Inscription[]>([])

getAddress('btc').then((address) => {
  addressRef.value = address
})

const { isLoading, data: inscriptionsData } = useBRCInscriptionsQuery(addressRef, cursorRef, sizeRef, {
  enabled: computed(() => !!addressRef.value),
})

watch(inscriptionsData, () => {
  if (inscriptionsData.value) {
    inscriptions.value.push(...inscriptionsData.value.list)
  }
})

const inscriptionsCountDisplay = computed(() => {
  if (!inscriptionsData.value) return '--'
  return `${inscriptionsData.value.list.length} items`
})

const toReceive = () => {
  router.push(`/wallet/receive?chain=btc`)
}

const loadBRCInscriptions = () => {
  cursorRef.value = cursorRef.value + 1
}

const toBRC20Detail = (inscriptionId: string) => {
  router.push({
    name: 'brc20Detail',
    params: {
      address: addressRef.value,
      inscriptionId,
    },
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-1" v-if="false">
      <div class="text-sm text-gray-500">NUMBER OF COLLECTIBLES</div>
      <div class="text-xl ">{{ inscriptionsCountDisplay }}</div>
    </div>

    <div v-if="false">
      <button class="secondary-btn flex w-full items-center justify-center gap-x-1 py-3" @click="toReceive">
        <ArrowDownLeftIcon class="h-4 w-4" />
        <span>Receive</span>
      </button>
    </div>

    <div v-if="isLoading" class="w-full py-3 text-center text-sm  text-gray-500">
      BRC Token List loading...
    </div>
    <div v-else-if="inscriptions.length">
      <div class="px-3 py-4 grid grid-cols-3 gap-x-1 gap-y-7">
        <div
          v-for="inscription in inscriptions"
          @click="toBRC20Detail(inscription.inscriptionId)"
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
      <div
        v-if="inscriptionsData && inscriptionsData.total > inscriptions.length"
        class="text-center text-gray-primary hover:underline cursor-pointer hover:text-blue-500"
        @click="loadBRCInscriptions"
      >
        Load more Ordinals
      </div>
    </div>
    <div v-else class="w-full py-3 text-center text-sm  text-gray-500">No Ordinals yet.</div>
  </div>
</template>

<style lang="less" scoped></style>
