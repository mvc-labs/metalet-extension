<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { totalBalance } from '@/lib/balance'
import SendJPG from '@/assets/icons-v3/send.jpg'
import SendHoverJPG from '@/assets/icons-v3/send_hover.jpg'
import ReceiveJPG from '@/assets/icons-v3/receive.jpg'
import ReceiveHoverJPG from '@/assets/icons-v3/receive_hover.jpg'
import SwapJPG from '@/assets/icons-v3/swap.jpg'
import SwapHoverJPG from '@/assets/icons-v3/swap_hover.jpg'
import BridgeJPG from '@/assets/icons-v3/bridge.jpg'
import BridgeHoverJPG from '@/assets/icons-v3/bridge_hover.jpg'

const router = useRouter()

const hoverIcon = ref()

function handleMouseOver(icon: string) {
  hoverIcon.value = icon // 鼠标悬停时切换图片
}

function handleMouseLeave() {
  hoverIcon.value = undefined // 鼠标离开时恢复原始图片
}

function toSelectAsset(purpose: 'receive' | 'send') {
  router.push({ name: 'select-asset', params: { purpose } })
}
</script>

<template>
  <div>
    <div class="mt-2 text-3xl font-bold">$ {{ totalBalance.toFixed(2) }} USD</div>

    <div class="text-black-secondary flex justify-between mt-6 text-[13px]">
      <div
        @click="toSelectAsset('send')"
        @mouseover="handleMouseOver('send')"
        @mouseleave="handleMouseLeave()"
        class="cursor-pointer flex flex-col items-center gap-y-[11px] hover:text-blue-primary"
      >
        <img :src="hoverIcon === 'send' ? SendHoverJPG : SendJPG" alt="Send" />
        <span>Send</span>
      </div>
      <div
        class="cursor-pointer flex flex-col items-center gap-y-[11px] hover:text-blue-primary"
        @click="toSelectAsset('receive')"
        @mouseover="handleMouseOver('receive')"
        @mouseleave="handleMouseLeave()"
      >
        <img :src="hoverIcon === 'receive' ? ReceiveHoverJPG : ReceiveJPG" alt="Send" />
        <span>Receive</span>
      </div>
      <div
        class="cursor-not-allowed flex flex-col items-center gap-y-[11px] hover:text-blue-primary"
        @mouseover="handleMouseOver('swap')"
        @mouseleave="handleMouseLeave()"
      >
        <img :src="hoverIcon === 'swap' ? SwapHoverJPG : SwapJPG" alt="Swap" />
        <span>Swap</span>
      </div>
      <div
        class="cursor-not-allowed flex flex-col items-center gap-y-[11px] hover:text-blue-primary"
        @mouseover="handleMouseOver('bridge')"
        @mouseleave="handleMouseLeave()"
      >
        <img :src="hoverIcon === 'bridge' ? BridgeHoverJPG : BridgeJPG" alt="Bridge" />
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
