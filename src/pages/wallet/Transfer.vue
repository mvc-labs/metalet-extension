<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import { useBRCTickerAseetQuery } from '@/queries/btc'

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
  <div class="flex flex-col pt-[30px] h-full" v-if="tickersData">
    <div class="flex flex-col gap-3">
      <div class="text-[#909399] text-base">Transfer amount</div>
      <div class="text-black-primary font-bold text-lg">
        {{ tickersData.tokenBalance.transferableBalance }} {{ symbol }}
      </div>
    </div>
    <div class="flex flex-col gap-3 mt-[30px]">
      <div class="text-[#909399] text-base">TRANSFER Inscriptions ({{ tickersData.transferableList.length }})</div>
      <div class="grid grid-cols-3 gap-2 mt-3">
        <div
          :key="ticker.inscriptionId"
          v-for="ticker in tickersData.transferableList"
          @click="toSendBRC20(ticker.inscriptionId, Number(ticker.amount))"
          class="flex flex-col items-center rounded-md bg-white aspect-square border border-[#D8D8D8] relative cursor-pointer"
        >
          <div class="mt-2.5 text-[#909399] text-sm">{{ ticker.ticker }}</div>
          <div class="mt-3 text-black-primary text-lg font-bold truncate">{{ ticker.amount }}</div>
          <div
            class="text-white text-xs bg-[#1E2BFF] rounded-b-md absolute bottom-0 w-full text-center pt-[5px] pb-[4px]"
          >
            <span v-if="ticker.inscriptionNumber === -1">Uncomfirmed</span>
            <span v-else>#{{ ticker.inscriptionNumber }}</span>
          </div>
        </div>
      </div>
    </div>
    <div
      @click="toInscribe"
      class="border border-[#D8D8D8] rounded-lg flex flex-col items-center justify-center gap-3 mt-[30px] py-[18px] cursor-pointer"
    >
      <div class="text-black-primary text-center text-lg font-bold">Inscribe TRANSFER</div>
      <div class="text-[#909399] text-center text-lg">
        Available {{ tickersData.tokenBalance.availableBalance }} {{ symbol }}
      </div>
    </div>
    <div class="mt-2 text-[#909399] text-sm text-center">
      * To send BRC-20, you have to inscribe a TRANSFER inscription first
    </div>
  </div>
  <div v-else-if="isLoading" class="text-center text-sm font-bold text-gray-500">BRC20 Asset Loading...</div>
</template>
