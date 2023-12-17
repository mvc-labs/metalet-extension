<script setup lang="ts">
import { useRouter } from 'vue-router'
import SuccessIcon from '@/assets/icons/success.svg'

const router = useRouter()

function confirm() {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center relative w-full h-full gap-y-4">
    <SuccessIcon />
    <div class="test-lg text-[#141416]">Payment Sent</div>
    <div class="text-base text-[#909399] w-52 text-center">Your transaction has been succesfully sent.</div>
    <button
      @click="confirm"
      class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100 absolute bottom-4 left-0"
    >
      OK
    </button>
  </div>
</template>

<style lang="css" scoped></style>
