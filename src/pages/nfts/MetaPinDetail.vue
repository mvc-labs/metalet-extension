<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatTimestamp } from '@/lib/formatters'
import { shortestAddress } from '@/lib/formatters'
import { useMetaPinQuery } from '@/queries/metaPin'

const { params } = useRoute()
const router = useRouter()

const address = params.address as string
const metaPinId = ref(params.metaPinId as string)

const { data: metaPin, isLoading } = useMetaPinQuery(metaPinId, { enabled: computed(() => !!address) })

const toSendNFT = (id: string) => {
  router.push({
    name: 'sendNFT',
    params: { id, nftType: 'metaPin' },
    query: {
      satoshis: metaPin.value?.outputValue,
      content: metaPin.value?.contentSummary,
      imgUrl: metaPin.value?.contentType === 'image/jpeg' ? metaPin.value?.content : undefined,
    },
  })
}
</script>

<template>
  <div class="w-full text-gray-primary text-center" v-if="isLoading">MetaPin Info Loading...</div>
  <div class="w-full" v-else-if="metaPin">
    <div class="w-full flex items-center justify-center">
      <div
        :class="[
          metaPin.contentType !== 'image/jpeg' ? 'p-2 bg-[#1E2BFF]' : undefined,
          'w-64 h-64  flex items-center justify-center rounded-xl relative text-white',
        ]"
      >
        <img
          alt=""
          :src="metaPin.content"
          v-if="metaPin.contentType === 'image/jpeg'"
          class="w-full h-full border-2 border-gray-soft rounded-xl"
        />
        <div class="overflow-hidden line-clamp-6 break-all" v-else>{{ metaPin.contentSummary }}</div>
        <span
          :title="`${metaPin.outputValue} sat`"
          class="absolute rounded right-3 bottom-3 py-3px px-1.5 bg-[rgb(235,236,255,0.2)] text-[#EBECFF] text-xs"
          >{{ metaPin.outputValue }} sat</span
        >
      </div>
    </div>
    <div class="flex flex-col p-4 gap-y-4">
      <h4 class="text-xl text-[#303133]"># {{ metaPin.number }}</h4>
      <div class="text-xs text-[#999999]">{{ formatTimestamp(metaPin.timestamp) }}</div>
      <hr />
      <div class="flex items-center justify-between">
        <span class="title">ID:</span>
        <div class="w-60 truncate" :title="metaPin.id">{{ metaPin.id }}</div>
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Address:</span>
        <div :title="address">{{ shortestAddress(address) }}</div>
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Output value:</span>
        <div>{{ metaPin.outputValue }}</div>
      </div>
      <div class="flex items-start justify-between">
        <span class="title">Preview</span>
        <a
          target="_blank"
          :href="metaPin.preview"
          :title="metaPin.preview"
          class="max-w-52 truncate text-[#5173B9] underline"
          >{{ metaPin.preview }}</a
        >
      </div>
      <div class="flex items-start justify-between">
        <span class="title">Content:</span>
        <a
          target="_blank"
          :href="metaPin.content"
          :title="metaPin.content"
          class="max-w-52 truncate text-[#5173B9] underline"
          >{{ metaPin.content }}</a
        >
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Content Length:</span>
        <span>{{ metaPin.contentLength }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="title">Content Type:</span>
        <span>{{ metaPin.contentType }}</span>
      </div>
      <div class="flex items-start justify-between">
        <span class="title">Timestamp:</span>
        <div>{{ formatTimestamp(metaPin.timestamp) }}</div>
      </div>
      <div class="flex items-start justify-between">
        <div class="title">Genesis Transaction:</div>
        <div class="w-44 truncate" :title="metaPin.genesisTransaction">{{ metaPin.genesisTransaction }}</div>
      </div>
    </div>

    <button @click="toSendNFT(metaPin!.id)" class="main-btn-bg w-full rounded-lg py-3 text-sm text-sky-100">
      Transfers
    </button>
  </div>
  <div v-else></div>
</template>

<style lang="css" scoped>
.title {
  font-size: 14px;
  color: #909399;
  font-weight: bold;
}
</style>
