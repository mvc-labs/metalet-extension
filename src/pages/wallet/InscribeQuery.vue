<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInscribeInfoQuery } from '@/queries/inscribe'

const route = useRoute()
const router = useRouter()
const symbol = ref(route.params.symbol as string)
const orderId = ref(route.params.orderId as string)
const { isLoading, data } = useInscribeInfoQuery(orderId, { enabled: computed(() => !!orderId.value) })

function confirm() {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center pt-[30px] relative w-full h-full gap-y-4">
    <div v-if="isLoading" class="text-gray-500 text-center font-bold">Order Info Loading...</div>
    <template v-else-if="data">
      <div class="flex flex-col items-center gap-[18px] w-full">
        <div class="text-lg text-black-primary font-bold">Inscribe Success</div>
        <div class="w-[160px] h-[168px] rounded-md relative border border-[#1E2BFF] overflow-hidden">
          <div class="break-all p-2 flex h-[128px] items-center justify-center text-black-primary">
            {{ `{"p":"brc-20","op":"transfer","tick":"${symbol}","amt":"546"}` }}
          </div>
          <div
            class="w-full h-10 leading-10 flex-shrink-0 text-center bg-[#1E2BFF] rounded-b-md text-white absolute bottom-0"
          >
            {{ data.inscriptionInfos?.[0]?.confirmed ? 'Confirmed' : 'Unconfirmed' }}
          </div>
        </div>
        <div class="text-base text-[#909399] w-full text-center">
          <div>The transfeerable and available</div>
          <div>balance of BRC20 will be rereshed in</div>
          <div>a few minutes.</div>
        </div>
      </div>
      <button
        @click="confirm"
        class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100 absolute bottom-4 left-0"
      >
        OK
      </button>
    </template>
    <div v-else class="text-gray-500 text-center font-bold">No Order Info.</div>
  </div>
</template>

<style lang="css" scoped></style>
