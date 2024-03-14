<script lang="ts" setup>
import Decimal from 'decimal.js'
import { computed, ref } from 'vue'
import { getTags } from '@/data/assets'
import { getFTLogo } from '@/data/logos'
import { type Asset } from '@/data/assets'
import CopyIcon from '@/assets/icons/copy.svg'
import { useRoute, useRouter } from 'vue-router'
import AssetLogo from '@/components/AssetLogo.vue'
import { useMVCTokenQuery } from '@/queries/tokens'
import Activities from './components/Activities.vue'
import SendPNG from '@/assets/icons-v3/send_detail.png'
import { toast } from '@/components/ui/toast/use-toast'
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'
import ReceivePNG from '@/assets/icons-v3/receive_detail.png'
import { calcBalance, prettifyTokenGenesis } from '@/lib/formatters'
import { useExchangeRatesQuery, getExchangeCoinType } from '@/queries/exchange-rates'

const route = useRoute()
const router = useRouter()

const symbol = route.params.symbol as string
const address = route.params.address as string
const genesis = route.params.genesis as string
const enabled = computed(() => !!address && !!symbol && !!genesis)

const tags = computed(() => {
  if (asset.value) {
    return getTags(asset.value)
  }
})

const { data: token } = useMVCTokenQuery(ref(address), genesis, { enabled })
const asset = computed(() => {
  if (token.value) {
    return {
      symbol: token.value.symbol,
      tokenName: token.value.name,
      isNative: false,
      chain: 'mvc',
      queryable: true,
      decimal: token.value.decimal,
      contract: 'MetaContract',
      codeHash: token.value.codeHash,
      genesis: token.value.genesis,
      logo: getFTLogo(token.value.name),
      balance: {
        total: token.value.confirmed + token.value.unconfirmed,
        confirmed: token.value.confirmed,
        unconfirmed: token.value.unconfirmed,
      },
    } as Asset
  }
})

const rateEnabled = computed(() => {
  if (asset.value) {
    return !!address && !!symbol
  }
  return false
})

const coinType = computed(() => {
  if (asset.value) {
    return getExchangeCoinType(asset.value.symbol, asset.value.contract)
  }
})

const { isLoading: isExchangeRateLoading, data: exchangeRate } = useExchangeRatesQuery(ref(symbol), coinType, {
  enabled: rateEnabled,
})

const assetUSD = computed(() => {
  if (isExchangeRateLoading.value) {
    return
  }
  const usdRate = new Decimal(exchangeRate.value?.price || 0)
  if (asset.value) {
    if (asset.value?.balance) {
      const balanceInStandardUnit = new Decimal(asset.value.balance?.total || 0).dividedBy(10 ** asset.value.decimal)
      return usdRate.mul(balanceInStandardUnit)
    }
  }
})

const toSend = () => {
  router.push({
    name: 'send-token',
    params: { symbol, genesis },
  })
}
const toReceive = () => {
  router.push(`/wallet/receive?chain=mvc`)
}

const copyGenesis = () => {
  navigator.clipboard.writeText(token.value!.genesis)
  toast({ title: `Token Contract ID Copied`, toastType: 'success', description: token.value!.genesis })
}
</script>

<template>
  <div class="flex flex-col items-center space-y-6 w-full" v-if="asset">
    <div class="flex flex-col items-center">
      <AssetLogo :logo="asset.logo" :chain="asset.chain" :symbol="asset.symbol" type="network" class="w-15" />

      <div class="mt-3 text-2xl">
        <span v-if="asset.balance"> {{ calcBalance(asset.balance.total, asset.decimal, asset.symbol) }}</span>
        <span v-else>-- {{ asset.symbol }}</span>
      </div>

      <div class="mt-0.5 text-sm text-gray-primary">$ {{ assetUSD?.toNumber() }} USD</div>

      <div
        v-for="tag in tags"
        :key="tag.name"
        :style="`background-color:${tag.bg};color:${tag.color};`"
        :class="['px-1.5', 'py-0.5', 'rounded', 'text-xs', 'inline-block', 'scale-75']"
      >
        {{ tag.name }}
      </div>
    </div>

    <div class="flex items-center justify-center gap-x-2">
      <button @click="toSend" class="btn-blue-light">
        <img :src="SendPNG" alt="Send" />
        <span>Send</span>
      </button>
      <button @click="toReceive" class="btn-blue-primary">
        <img :src="ReceivePNG" alt="Receive" />
        <span>Receive</span>
      </button>
    </div>

    <div class="mt-8 self-stretch">
      <div class="text-xs text-gray-500">Token Contract ID</div>
      <div class="flex items-center">
        <CheckBadgeIcon class="mr-1 h-5 w-5 text-blue-500" />
        <div class="text-base text-gray-900">{{ prettifyTokenGenesis(asset.genesis!) }}</div>

        <CopyIcon class="ml-2 cursor-pointer" @click.stop="copyGenesis" />
      </div>
    </div>

    <div class="w-full">
      <div class="-mx-4 h-11 bg-gray-light px-4 py-[13px] text-ss" v-if="false">
        <DropdownMenu>
          <DropdownMenuTrigger class="flex items-center justify-between w-full">
            <div class="flex items-center gap-x-2">
              <span>Time</span>
              <SelectorIcon />
            </div>
            <FilterIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="bg-white">
            <DropdownMenuItem @select="null">Time</DropdownMenuItem>
            <DropdownMenuItem @select="null">Other</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Activities class="mt-8 self-stretch" :asset="asset" :exchangeRate="Number(exchangeRate)" :address="address" />
    </div>
  </div>
  <Loading v-else text="Asset Loading..." />
</template>

<style scoped lang="css">
.btn {
  @apply w-[119px] h-12 rounded-3xl flex items-center justify-center gap-x-2;
}

.btn-blue-light {
  @apply btn bg-blue-light text-blue-primary;
}

.btn-blue-primary {
  @apply btn bg-blue-primary text-white;
}

div[role='tablist'] {
  @apply p-0 h-auto;
}

button[role='tab'] {
  @apply flex flex-col items-center px-0 py-4 rounded-none border-b-2 border-transparent;
}

button[role='tab'][aria-selected='true'] {
  @apply border-blue-primary;
}

div[role='tabpanel'] {
  @apply px-3 py-4 mt-0;
}
</style>
