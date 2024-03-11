<script setup lang="ts">
import { computed, ref } from 'vue'
import { getAddress } from '@/lib/account'
import Ticker from './components/Ticker.vue'
import { Loading, FlexBox, Button } from '@/components'
import { useRouter, useRoute } from 'vue-router'
import { useInscribeInfoQuery } from '@/queries/inscribe'

const route = useRoute()
const router = useRouter()

const symbol = route.params.symbol as string
const orderId = ref(route.params.orderId as string)
const { isLoading, data } = useInscribeInfoQuery(orderId, { enabled: computed(() => !!orderId.value) })

const info = computed(() => data.value?.inscriptionInfos?.[0])

function confirm() {
  getAddress('btc').then((address) => {
    router.push({
      name: 'asset',
      params: {
        symbol,
        address,
      },
      query: {
        refresh: 1,
      },
    })
  })
}
</script>

<template>
  <div class="pt-22.5 relative w-full h-full gap-y-4">
    <Loading v-if="isLoading" text="Order Info Loading..." />
    <template v-else-if="data">
      <FlexBox d="col" ai="center" class="gap-y-6">
        <Ticker
          :text="`{&quot;p&quot;:&quot;brc-20&quot;,&quot;op&quot;:&quot;transfer&quot;,&quot;tick&quot;:&quot;${symbol}&quot;,&quot;amt&quot;:&quot;546&quot;}`"
          :inscriptionNumber="info?.inscriptionNum"
          class="w-36"
        />
        <FlexBox d="col" ai="center" :gap="1">
          <div class="text-base">Inscribe Succes</div>
          <div class="text-sm text-gray-primary text-center">
            The transfeerable and available balance of <br />
            BRC20 will be rereshed in a few minutes.
          </div>
        </FlexBox>
      </FlexBox>
      <Button type="primary" @click="confirm" class="absolute bottom-20 left-1/2 -translate-x-1/2 w-61.5 h-12">
        Done
      </Button>
    </template>
    <div v-else class="text-gray-500 text-center font-bold">No Order Info.</div>
  </div>
</template>

<style lang="css" scoped></style>
