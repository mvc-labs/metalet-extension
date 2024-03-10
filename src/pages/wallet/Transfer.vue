<script lang="ts" setup>
import { computed, ref } from 'vue'
import Loading from '@/components/Loading.vue'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import TickerList from './components/TickerList.vue'
import { useBRCTickerAseetQuery } from '@/queries/btc'
import { FlexBox, Divider, Button } from '@/components'

const route = useRoute()
const router = useRouter()

if (!route.params.address || !route.params.symbol) {
  router.go(-1)
}

const address = ref<string>(route.params.address as string)
const symbol = ref<SymbolTicker>(route.params.symbol as SymbolTicker)

const { isLoading, data: tickersData } = useBRCTickerAseetQuery(address, symbol, {
  enabled: computed(() => !!address.value),
})

const toSendBRC20 = (inscriptionId: string, amount: number) => {
  router.push({
    name: 'sendBRC20',
    query: { address: address.value, symbol: symbol.value, inscriptionId, amount },
  })
}

const toInscribe = () => {
  router.push({ name: 'inscribe', params: { address: address.value, symbol: symbol.value } })
}
</script>

<template>
  <Loading :text="`${symbol} Transfer info Loading...`" v-if="isLoading" />
  <FlexBox d="col" class="pt-1" :gap="4" v-else-if="tickersData">
    <div class="flex flex-col gap-3">
      <div class="text-sm">Transfer Amount</div>
      <FlexBox d="col" class="p-4 border border-gary-soft rounded-lg">
        <FlexBox ai="center" jc="between" class="w-full">
          <span class="text-xl">{{ tickersData.tokenBalance.transferableBalance }} {{ symbol }}</span>
          <!-- TODO: select all -->
          <button class="text-xs text-blue-primary cursor-not-allowed" disabled>Select All</button>
        </FlexBox>
        <Divider class="border-gray-soft my-4" />
        <FlexBox d="col" :gap="4">
          <span class="text-sm text-slate-light"
            >Transfer Inscriptions ({{ tickersData.transferableList.length }})</span
          >
          <!-- TODO: select multiple-->
          <TickerList :loading="isLoading" :list="tickersData.transferableList" :clickEvent="toSendBRC20" />
        </FlexBox>
      </FlexBox>
    </div>
    <div>
      <div class="text-sm">Inscribe Transfer</div>
      <div class="text-gray-primary text-xs">You have to inscribe a TRANSFER inscription first.</div>
      <FlexBox
        ai="center"
        jc="center"
        class="bg-gray-secondary text-sm rounded-md h-12 mt-3 cursor-pointer"
        @click="toInscribe"
      >
        Available {{ tickersData.tokenBalance.availableBalance }} {{ symbol }}
      </FlexBox>
    </div>
    <!-- <div class="w-full pt-0.5">
      <Button class="mx-auto my-6">Next</Button>
    </div> -->
  </FlexBox>
</template>
