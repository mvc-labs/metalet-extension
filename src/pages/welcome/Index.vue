<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAccounts } from '@/lib/account'
import MetaletLogoImg from '@/assets/images/metalet-logo.png?url'

const router = useRouter()

const createWallet = () => {
  router.push('/wallet/create')
}

const accountsCount = ref(0)
getAccounts().then((accounts) => {
  accountsCount.value = accounts.size
})
</script>

<template>
  <div class="flex h-full flex-col justify-between text-center">
    <div class="">
      <div class="mt-12">
        <img class="mx-auto h-20 w-20" :src="MetaletLogoImg" alt="metalet-logo" />
      </div>

      <div class="mt-4">
        <h1 class="text-3xl font-extrabold">Metalet</h1>
        <p class="mt-4 text-lg text-gray-400">Wallet for MVC & Bitcoin</p>
      </div>
    </div>

    <div class="flex flex-col items-stretch gap-y-4">
      <button class="gradient-bg rounded-md py-4 text-base leading-none text-white"
        @click="() => $router.push('/accounts')" v-if="accountsCount">
        Connect
      </button>

      <button class="gradient-bg rounded-md py-4 text-base leading-none text-white" @click="createWallet">
        Create Wallet
      </button>

      <button class="rounded-md border border-primary-blue py-4 text-base leading-none"
        @click="router.push('/wallet/import')">
        Restore Wallet
      </button>
    </div>
  </div>
</template>
