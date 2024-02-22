<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SuccessIcon from '@/assets/icons/success.svg'

const route = useRoute()
const router = useRouter()

const symbol = ref(route.params.symbol as string)
const orderId = ref(route.params.orderId as string)

function toOrder() {
  router.push({
    name: 'inscribe-query',
    params: { orderId: orderId.value, symbol: symbol.value },
  })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center relative w-full h-full gap-y-4">
    <SuccessIcon />
    <div class="text-lg text-black-primary font-bold">Payment Sent</div>
    <div class="text-base text-[#909399] w-52 text-center">Your transaction has been succesfully sent.</div>
    <button
      @click="toOrder"
      class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100 absolute bottom-4 left-0"
    >
      OK
    </button>
  </div>
</template>

<style lang="css" scoped></style>
