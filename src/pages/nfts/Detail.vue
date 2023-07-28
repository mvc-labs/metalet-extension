<script lang="ts" setup>
import { ComputedRef, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/solid'

import { useOneNftQuery } from '@/queries/nfts'
import { useNftInfoQuery } from '@/queries/metadata'
import { useOneActivityQuery } from '@/queries/activities'
import { parseMetaFile } from '@/lib/metadata'
import { prettifyTimestamp, prettifyTxId, prettifyTokenGenesis, toTx } from '@/lib/helpers'
import { isOfficialNft } from '@/lib/nft'
import { getBrowserHost } from '@/lib/host'

const router = useRouter()
const { codehash, genesis, tokenIndex } = defineProps<{
  codehash: string
  genesis: string
  tokenIndex: number
}>()

const { isLoading: isLoadingNft, data: nft } = useOneNftQuery({
  codehash,
  genesis,
  tokenIndex,
})

const enabled = computed(() => !!nft.value?.metaTxid)

const metaTxid = computed(() => nft.value?.metaTxid) as ComputedRef<string>
const metaOutputIndex = computed(() => nft.value?.metaOutputIndex) as ComputedRef<number>
const { isLoading: isLoadingNftInfo, data: nftInfo } = useNftInfoQuery(metaTxid, metaOutputIndex, {
  enabled,
})

const coverUrl = computed(() => {
  if (!nftInfo.value || !nftInfo.value.icon) return null

  return parseMetaFile(nftInfo.value.icon)
})

const isCopied = ref(false)
const copyGenesis = () => {
  navigator.clipboard.writeText(nft.value!.genesis)
  isCopied.value = true
}
const toActivityTx = async () => {
  const host = await getBrowserHost()
  toTx(nft.value!.txid, host)
}

const activityId = computed(() => nft.value?.txid) as ComputedRef<string>
const { data: activity, isLoading: isLoadingActivity } = useOneActivityQuery(activityId, {
  enabled: computed(() => !!nft.value?.txid),
})

const toTransferNft = () => {
  router.push(`/nfts/transfer-nft/${codehash}/${genesis}/${tokenIndex}`)
}
</script>

<template>
  <div class="" v-if="isLoadingNftInfo">Loading</div>
  <div class="" v-else-if="nftInfo && nft">
    <!-- image -->
    <div class="mx-auto aspect-square w-3/4 overflow-hidden rounded-lg">
      <img :src="coverUrl" class="h-full w-full object-contain" v-if="coverUrl" />
    </div>

    <!-- info -->
    <div class="mt-8 flex items-center gap-2">
      <div class="text-lg font-bold">{{ nftInfo.name }}</div>
      <div class="text-sm text-gray-500">{{ '# ' + nft.tokenIndex }}</div>
    </div>
    <div class="mt-2 flex items-center gap-1.5 border-b border-gray-100 pb-4">
      <div class="rounded bg-indigo-500 px-2 py-1 text-xs text-indigo-50">MVC</div>
      <div class="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-500">MetaContract</div>
    </div>

    <div class="space-y-3 pt-4">
      <div class="row">
        <div class="label">Creator</div>
        <div class="value">{{ nftInfo.creator }}</div>
      </div>

      <!-- ID -->
      <div class="row">
        <div class="label">Token Index</div>
        <div class="value">{{ nft.tokenIndex }}</div>
      </div>

      <!-- series -->
      <div class="row">
        <div class="label">Series Genesis</div>
        <div class="value flex items-center">
          <CheckBadgeIcon class="mr-1 h-5 w-5 text-blue-500" v-if="nft && isOfficialNft(nft.genesis)" />
          <div class="">{{ prettifyTokenGenesis(nft.genesis) }}</div>

          <ClipboardDocumentCheckIcon class="ml-2 h-4 w-4 text-blue-500" v-if="isCopied" />
          <button class="ml-2 text-gray-400 hover:text-gray-500" @click.stop="copyGenesis" type="button" v-else>
            <ClipboardDocumentListIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- last activity txid -->
      <div class="row">
        <div class="label">Last Activity</div>
        <div class="value flex items-center">
          <div class="">{{ prettifyTxId(nft.txid) }}</div>

          <button class="ml-2 text-gray-500 hover:text-blue-500" @click.stop="toActivityTx" type="button">
            <ArrowTopRightOnSquareIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- last activity at -->
      <div class="row">
        <div class="label">Last Activity At</div>
        <div class="value" v-if="isLoadingActivity">
          <div class="text-gray-500">...</div>
        </div>
        <div class="value" v-else-if="activity">{{ prettifyTimestamp(activity.time) }}</div>
      </div>
    </div>

    <!-- control -->
    <div class="my-8">
      <button class="main-btn-bg w-full rounded-md py-3 text-center text-base text-white" @click="toTransferNft">
        Transfer
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
