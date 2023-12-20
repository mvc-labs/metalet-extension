<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { getAddress } from '@/lib/account'
import { shortestAddress } from '@/lib/formatters'
import { Inscription } from '@/queries/inscribe'
import { ordinalsApi } from '@/queries/request'

const { query } = useRoute()
const address = ref('')
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
  </div>
</template>

<style lang="css" scoped>
.title {
  font-size: 14px;
  color: #909399;
  font-weight: bold;
}
</style>
