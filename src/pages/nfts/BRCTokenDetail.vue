<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { shortestAddress } from '@/lib/formatters'
import { useBRCInscriptionInfoQuery } from '@/queries/inscribe'

const router = useRouter()
const { params } = useRoute()

const address = ref(params.address as string)
const inscriptionId = ref(params.inscriptionId as string)

const {
  isLoading,
  data: inscriptionDetail,
  error,
} = useBRCInscriptionInfoQuery(inscriptionId, {
  enabled: computed(() => !!inscriptionId.value),
})

watch(error, () => {
  if (error) {
    router.go(-1)
  }
})

const toSendBRC20 = () => {
  const content = JSON.parse(inscriptionDetail.value!.contentBody)
  router.push({
    name: 'sendBRC20',
    query: {
      inscriptionId: inscriptionId.value,
      address: address.value,
      symbol: content.tick,
      amount: content.amt,
    },
  })
}
</script>

<template>
  <div class="w-full text-gray-primary text-center" v-if="isLoading">Inscription Info Loading...</div>
  <div class="w-full" v-else-if="inscriptionDetail">
    <div class="w-full flex items-center justify-center">
      <div class="w-64 h-64 bg-[#1E2BFF] flex items-center justify-center rounded-xl relative p-2">
        <div class="text-white break-all">{{ inscriptionDetail.contentBody }}</div>
        <span class="absolute rounded right-3 bottom-3 py-3px px-1.5 bg-[rgb(235,236,255,0.2)] text-[#EBECFF] text-xs"
          >{{ inscriptionDetail.outputValue }} sats</span
        >
      </div>
    </div>
    <div class="flex flex-col p-4 gap-y-4">
      <h4 class="text-xl text-[#303133]">
        <span v-if="inscriptionDetail.inscriptionNumber !== -1"># {{ inscriptionDetail.inscriptionNumber }}</span>
        <span v-else>Uncomfirmed</span>
      </h4>
      <div class="text-xs text-[#999999]">
        {{ dayjs(inscriptionDetail.timestamp * 1000).format('YYYY/MM/DD HH:mm:ss') }}
      </div>
      <hr />
      <div class="flex items-center justify-between">
        <span class="title">ID:</span>
        <div class="w-60 truncate" :title="inscriptionDetail.inscriptionId">
          {{ inscriptionDetail.inscriptionId }}
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Address:</span>
        <div :title="address">{{ shortestAddress(address) }}</div>
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Output value:</span>
        <div>{{ inscriptionDetail.outputValue }}</div>
      </div>
      <div class="flex items-start justify-between">
        <span class="title">Preview</span>
        <a
          target="_blank"
          :href="inscriptionDetail.preview"
          :title="inscriptionDetail.preview"
          class="w-52 truncate text-[#5173B9] underline"
          >{{ inscriptionDetail.preview }}</a
        >
      </div>
      <div class="flex items-start justify-between">
        <span class="title">Content:</span>
        <a
          target="_blank"
          :href="inscriptionDetail.content"
          :title="inscriptionDetail.content"
          class="w-52 truncate text-[#5173B9] underline"
          >{{ inscriptionDetail.content }}</a
        >
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Content Length:</span>
        <span>{{ inscriptionDetail.contentLength }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Content Type:</span>
        <span>{{ inscriptionDetail.contentType }}</span>
      </div>
      <div class="flex items-start justify-between">
        <span class="title">Timestamp:</span>
        <div>{{ dayjs(inscriptionDetail.timestamp * 1000).format('YYYY/MM/DD HH:mm:ss') }}</div>
      </div>
      <div class="flex items-start justify-between">
        <div class="title">Genesis Transaction:</div>
        <div class="w-44 truncate" :title="inscriptionDetail.genesisTransaction">
          {{ inscriptionDetail.genesisTransaction }}
        </div>
      </div>
    </div>

    <button @click="toSendBRC20" class="main-btn-bg w-full rounded-lg py-3 text-sm  text-sky-100">
      Transfers
    </button>
  </div>
</template>

<style lang="css" scoped>
.title {
  font-size: 14px;
  color: #909399;
  font-weight: bold;
}
</style>
