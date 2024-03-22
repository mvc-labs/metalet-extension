<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'
import { getAddress } from '@/lib/account'
import { ordinalsApi } from '@/queries/request'
import { useRoute, useRouter } from 'vue-router'
import { Inscription } from '@/queries/inscribe'
import { shortestAddress } from '@/lib/formatters'

const address = ref('')
const router = useRouter()
const { query } = useRoute()
const inscription = JSON.parse(JSON.stringify(query)) as Inscription

getAddress('btc').then((addressStr) => {
  address.value = addressStr
})

const content = ref('')

ordinalsApi(inscription.content)
  .get()
  .then((data: string) => {
    content.value = data
  })

const toSendBRC20 = () => {
  router.push({
    name: 'sendBRC20',
    query: {
      address: address.value,
      symbol: 'BTC',
      inscriptionId: inscription.inscriptionId,
      amount: inscription.outputValue / 1e8,
    },
  })
}
</script>

<template>
  <div class="w-full">
    <div class="w-full flex items-center justify-center">
      <div class="w-64 h-64 bg-[#1E2BFF] flex items-center justify-center rounded-xl relative p-2">
        <div class="text-white break-all">{{ content }}</div>
        <span class="absolute rounded right-3 bottom-3 py-3px px-1.5 bg-[rgb(235,236,255,0.2)] text-[#EBECFF] text-xs"
          >{{ inscription.outputValue }} sat</span
        >
      </div>
    </div>
    <div class="flex flex-col p-4 gap-y-4">
      <h4 class="text-xl text-[#303133]"># {{ inscription.inscriptionNumber }}</h4>
      <div class="text-xs text-[#999999]">
        {{ dayjs(Number(inscription!.timestamp)).format('YYYY/MM/DD HH:mm:ss') }}
      </div>
      <hr />
      <div class="flex items-center justify-between">
        <span class="title">ID:</span>
        <div class="w-60 truncate" :title="inscription.inscriptionId">{{ inscription.inscriptionId }}</div>
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Address:</span>
        <div :title="address">{{ shortestAddress(address) }}</div>
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Output value:</span>
        <div>{{ inscription.outputValue }}</div>
      </div>
      <div class="flex items-start justify-between">
        <span class="title">Preview</span>
        <a
          target="_blank"
          :href="inscription.preview"
          :title="inscription.preview"
          class="w-52 truncate text-[#5173B9] underline"
          >{{ inscription.preview }}</a
        >
      </div>
      <div class="flex items-start justify-between">
        <span class="title">Content:</span>
        <a
          target="_blank"
          :href="inscription.content"
          :title="inscription.content"
          class="w-52 truncate text-[#5173B9] underline"
          >{{ inscription.content }}</a
        >
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Content Length:</span>
        <span>{{ inscription.contentLength }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Content Type:</span>
        <span>{{ inscription.contentType }}</span>
      </div>
      <div class="flex items-start justify-between">
        <span class="title">Timestamp:</span>
        <div>{{ dayjs(Number(inscription!.timestamp)).format('YYYY/MM/DD HH:mm:ss') }}</div>
      </div>
      <div class="flex items-start justify-between">
        <div class="title">Genesis Transaction:</div>
        <div class="w-44 truncate" :title="inscription.genesisTransaction">{{ inscription.genesisTransaction }}</div>
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
