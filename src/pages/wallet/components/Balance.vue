<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { totalBalance } from '@/lib/balance'
import SendIcon from '@/assets/icons-v3/send.svg'
import SwapIcon from '@/assets/icons-v3/swap.svg'
import BridgeIcon from '@/assets/icons-v3/bridge.svg'
import ReceiveIcon from '@/assets/icons-v3/receive.svg'

import { ArrowUpRightIcon, QrCodeIcon } from '@heroicons/vue/20/solid'

const router = useRouter()

function toSelectAsset(purpose: 'receive' | 'send') {
  const selectAssetRoute = {
    name: 'select-asset',
    query: {
      purpose,
    },
  }
  router.push(selectAssetRoute)
}
</script>

<template>
  <div>
    <div class="mt-2 text-3xl font-bold">$ {{ totalBalance.toFixed(2) }} USD</div>

    <div class="text-black-secondary flex justify-between mt-6 text-[13px]">
      <div class="cursor-pointer flex flex-col items-center gap-y-[11px]" @click="toSelectAsset('send')">
        <SendIcon />
        <span>Send</span>
      </div>
      <div class="cursor-pointer flex flex-col items-center gap-y-[11px]" @click="toSelectAsset('receive')">
        <ReceiveIcon />
        <span>Receive</span>
      </div>
      <div class="cursor-not-allowed flex flex-col items-center gap-y-[11px]">
        <SwapIcon />
        <span>Swap</span>
      </div>
      <div class="cursor-not-allowed flex flex-col items-center gap-y-[11px]">
        <BridgeIcon />
        <span>Bridge</span>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.button {
  @apply flex items-center justify-center rounded-md bg-btn-blue py-3 text-sm text-white;
}
</style>
