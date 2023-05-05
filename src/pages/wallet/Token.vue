<script lang="ts" setup>
import { computed, ref, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getAddress } from '../../lib/account'
import { prettifyTokenBalance } from '../../lib/helpers'
import Activities from './components/Activities.vue'
import { useTokenQuery } from '../../queries/tokens'
import { CircleStackIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()
const symbol = route.params.symbol as string

const address: Ref<string> = ref('')
getAddress().then((add) => {
  address.value = add!
})
const enabled = computed(() => !!address.value)

// 用户拥有的代币资产
const { isLoading, data: token } = useTokenQuery(address, symbol, { enabled })

const toSend = () => {
  router.push(`/wallet/send?symbol=${symbol}`)
}
const toReceive = () => {
  router.push(`/wallet/receive?chain=${token.value!.chain}`)
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center">
    <img :src="token.logo" alt="" class="h-20 w-20 rounded-xl" v-if="token && token.logo" />

    <CircleStackIcon v-else class="h-16 w-20 text-gray-300" />

    <div v-if="isLoading" class="mt-8">--</div>
    <div v-else-if="token" class="mt-8 flex flex-col items-center self-stretch">
      <div class="mb-1 text-center text-xl">
        {{ prettifyTokenBalance(token.total, token.decimal) + ' ' + token.symbol }}
      </div>

      <!-- buttons -->
      <div class="mt-8 grid grid-cols-2 gap-x-3 self-stretch">
        <button class="secondary-btn col-span-1 py-3" @click="toSend">SEND</button>
        <button class="secondary-btn col-span-1 py-3" @click="toReceive">RECEIVE</button>
      </div>

      <Activities class="mt-8 self-stretch" :asset="token" />
    </div>
  </div>
</template>
