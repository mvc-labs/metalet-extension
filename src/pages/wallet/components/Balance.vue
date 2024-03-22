<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { totalBalance } from '@/lib/balance'
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
  <div class="pt-4">
    <div class="text-gray-500">Total Balance</div>
    <div class="mt-2 text-3xl ">
      $ {{ totalBalance.toFixed(2) }} USD
    </div>

    <!-- 接收和发送按钮 -->
    <div class="mt-4 grid grid-cols-2 gap-2 self-stretch">
      <button @click="toSelectAsset('send')" class="button">
        <ArrowUpRightIcon class="mr-1 h-4 w-4" />
        <span>Send</span>
      </button>
      <button @click="toSelectAsset('receive')" class="button">
        <QrCodeIcon class="mr-1 h-4 w-4" />
        <span>Receive</span>
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
.button {
  @apply flex items-center justify-center rounded-md bg-btn-blue py-3 text-sm text-white;
}
</style>
