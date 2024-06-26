<script lang="ts" setup>
import { computed, ref } from 'vue'
import { UseImage } from '@vueuse/components'
import { isOfficialToken } from '@/lib/assets'
import { useRoute, useRouter } from 'vue-router'
import { useMVCTokenQuery } from '@/queries/tokens'
import Activities from './components/Activities.vue'
import { prettifyTokenBalance, prettifyTokenGenesis } from '@/lib/formatters'
import {
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ArrowUpRightIcon,
  QrCodeIcon,
} from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()

const symbol = route.params.symbol as string
const address = route.params.address as string
const genesis = route.params.genesis as string
const enabled = computed(() => !!address && !!symbol && !!genesis)

const { isLoading, data: asset } = useMVCTokenQuery(ref(address), ref(genesis), { enabled })

const toSend = () => {
  router.push({
    name: 'send-token',
    params: { symbol, genesis, address },
  })
}
const toReceive = () => {
  router.push(`/wallet/receive?chain=mvc`)
}

const isCopied = ref(false)
const copyGenesis = () => {
  navigator.clipboard.writeText(genesis)
  isCopied.value = true
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center">
    <div v-if="isLoading" class="text-center text-gray-500">Token Asset Loading...</div>

    <template v-else-if="!!asset">
      <!-- logo -->
      <UseImage :src="asset.logo" v-if="asset.logo && asset.codeHash" class="h-20 w-20 rounded-xl">
        <template #error>
          <div style="line-height: 80px" class="h-20 w-20 text-center rounded-full text-white text-3xl bg-[#1E2BFF]">
            {{ symbol[0].toLocaleUpperCase() }}
          </div>
        </template>
      </UseImage>
      <div v-else style="line-height: 80px" class="h-20 w-20 text-center rounded-full text-white text-3xl bg-[#1E2BFF]">
        {{ symbol[0].toLocaleUpperCase() }}
      </div>

      <!-- token info -->
      <div class="mt-4 flex flex-col items-center self-stretch">
        <div class="mb-1 text-center text-xl" v-if="asset.balance">
          {{ prettifyTokenBalance(asset.balance?.total, asset.decimal, true, symbol) }}
        </div>

        <!-- Contract ID -->
        <div class="mt-8 self-stretch">
          <div class="text-xs text-gray-500">Token Contract ID</div>
          <div class="flex items-center">
            <CheckBadgeIcon class="mr-1 h-5 w-5 text-blue-500" v-if="isOfficialToken(genesis)" />
            <div class="text-base text-gray-900">{{ prettifyTokenGenesis(genesis) }}</div>

            <ClipboardDocumentCheckIcon class="ml-2 h-4 w-4 text-blue-500" v-if="isCopied" />
            <button class="ml-2 text-gray-400 hover:text-gray-500" @click.stop="copyGenesis" type="button" v-else>
              <ClipboardDocumentListIcon class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- buttons -->
        <div class="mt-4 grid grid-cols-2 gap-x-3 self-stretch">
          <button class="button" @click="toSend">
            <ArrowUpRightIcon class="mr-1 h-4 w-4" />
            <span>Send</span>
          </button>
          <button class="button" @click="toReceive">
            <QrCodeIcon class="mr-1 h-4 w-4" />
            <span>Receive</span>
          </button>
        </div>

        <Activities class="mt-8 self-stretch" v-if="asset" :asset="asset" :address="address" />
      </div>
    </template>

    <div v-else class="text-center text-gray-500">No Token Asset.</div>
  </div>
</template>

<style lang="css" scoped>
.button {
  @apply flex items-center justify-center rounded-md bg-btn-blue py-3 text-sm text-white;
}
</style>
