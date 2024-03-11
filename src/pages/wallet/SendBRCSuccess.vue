<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FlexBox, Divider, Button } from '@/components'
import SuccessPNG from '@/assets/icons-v3/send-success.png'

const route = useRoute()
const router = useRouter()

const symbol = ref(route.params.symbol as string)
const amount = ref(route.params.amount as string)
const receiver = ref(route.params.address as string)

function toWallet() {
  router.push('/wallet')
}
</script>

<template>
  <FlexBox d="col" ai="center" class="relative w-full h-full gap-y-6 pt-[68px]">
    <img :src="SuccessPNG" alt="Send Success" class="w-30" />
    <div class="text-base">Transaction Completed</div>
    <FlexBox d="col" ai="center" jc="center" class="border border-gray-soft py-3.5 px-4">
      <div class="mb-1">{{ amount }} {{ symbol }}</div>
      <div class="label">Amount</div>
      <Divider :dashed="true" class="my-3.5 border-gray-soft w-full" />
      <div class="break-all text-center mb-1">{{ receiver }}</div>
      <div class="label">Receiver</div>
    </FlexBox>
    <Button type="primary" @click="toWallet" class="mt-16 w-61.5 h-12">
      Done
    </Button>
  </FlexBox>
</template>

<style lang="css" scoped>
.label {
  @apply text-xs text-gray-primary;
}
</style>
