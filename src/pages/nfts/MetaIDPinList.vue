<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, computed } from 'vue'
import MetaPin from './MetaPin.vue'
import { useRouter } from 'vue-router'
import { getAddress } from '@/lib/account'
import { useMetaPinsQuery } from '@/queries/nfts'

const addressRef = ref()
const cursorRef = ref(0)
const sizeRef = ref(10)
const router = useRouter()

getAddress('btc').then((address) => {
  addressRef.value = address
})
const { isLoading, data: metaPins } = useMetaPinsQuery(addressRef, cursorRef, sizeRef, {
  enabled: computed(() => !!addressRef.value),
})

const toMetaPinDetail = (metaPinId: string) => {
  router.push({
    name: 'metaPinDetail',
    params: { metaPinId, address: addressRef.value },
  })
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="isLoading" class="w-full py-3 text-center text-sm text-gray-500">MetaID Pin List loading...</div>
    <div v-else-if="metaPins?.length" class="mt-12 px-3 py-4 grid grid-cols-3 gap-x-3 gap-y-7">
      <div
        v-for="metaPin in metaPins"
        @click="toMetaPinDetail(metaPin.id)"
        class="flex flex-col items-center justify-center rounded-md cursor-pointer text-[#999999]"
      >
        <MetaPin :value="metaPin.outputValue" :content="metaPin.contentSummary" :contentType="metaPin.contentType" />
        <span class="text-sm text-center mt-3 truncate" :title="'# ' + metaPin.number"># {{ metaPin.number }}</span>
        <span class="text-xs text-center mt-1 h-[30px]">{{
          metaPin.timestamp === 0 ? 'Uncomfirmed' : dayjs(metaPin.timestamp * 1000).format('YYYY/MM/DD HH:mm:ss')
        }}</span>
      </div>
    </div>
    <div v-else class="w-full py-3 text-center text-sm text-gray-500">No MetaID Pins yet</div>
  </div>
</template>

<style lang="less" scoped></style>
