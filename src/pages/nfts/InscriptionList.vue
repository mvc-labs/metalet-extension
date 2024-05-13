<script setup lang="ts">
import { ref, computed } from 'vue'
import BRCToken from './BRCToken.vue'
import { useRouter } from 'vue-router'
import { getAddress } from '@/lib/account'
import { formatTimestamp } from '@/lib/formatters'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { useInscriptionsInfiniteQuery } from '@/queries/inscribe'

const size = ref(10)
const address = ref()
const router = useRouter()

getAddress('btc').then((_address) => {
  address.value = _address
})

const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInscriptionsInfiniteQuery(
  address,
  size,
  {
    enabled: computed(() => !!address.value),
  }
)

const inscriptions = computed(() => (data.value ? data.value.pages.flatMap((page) => page.list) : []))

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
  <div class="space-y-4">
    <div v-if="isLoading" class="w-full py-3 text-center text-sm text-gray-500">Ordinals loading...</div>
    <div v-else-if="inscriptions.length">
      <div class="px-3 py-4 grid grid-cols-3 gap-x-3 gap-y-7">
        <div
          v-for="inscription in inscriptions"
          @click="toBRC20Detail(inscription.inscriptionId)"
          class="flex flex-col items-center justify-center rounded-md cursor-pointer text-[#999999]"
        >
          <BRCToken :value="inscription.outputValue" :contentBody="inscription.contentBody" />
          <span class="text-sm text-center mt-3 truncate" :title="'# ' + inscription.inscriptionNumber">{{
            inscription.utxoHeight === 0 ? 'Uncomfirmed' : `# ${inscription.inscriptionNumber}`
          }}</span>
          <span class="text-xs text-center mt-1 h-[30px]">{{ formatTimestamp(inscription.timestamp) }}</span>
        </div>
      </div>
      <div
        v-if="hasNextPage"
        :disabled="isFetchingNextPage"
        @click="() => fetchNextPage()"
        :class="[
          'text-gray-primary flex items-center gap-2 justify-center',
          !isFetchingNextPage ? 'cursor-pointer hover:text-blue-500 hover:underline' : 'cursor-not-allowed',
        ]"
      >
        <span>Load more Ordinals</span>
        <LoadingIcon v-if="isFetchingNextPage" class="!text-gray-primary" />
      </div>
    </div>
    <div v-else class="w-full py-3 text-center text-sm text-gray-500">No Ordinals yet.</div>
  </div>
</template>

<style lang="less" scoped></style>
