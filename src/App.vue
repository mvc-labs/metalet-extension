<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, Ref, inject } from 'vue'
import { API_NET, API_TARGET, Wallet } from 'meta-contract'

import { getNetwork } from './lib/network'
import { getCurrentAccount, getPrivateKey } from './lib/account'
import { FEEB } from './data/config'
import BgHueImg from './assets/images/bg-hue.png?url'

import TheFooter from './components/the-footer/Index.vue'
import TheHeader from './components/headers/TheHeader.vue'
import SecondaryHeader from './components/headers/SecondaryHeader.vue'

const route = useRoute()

// setup vue-query
import { useQueryClient } from '@tanstack/vue-query'
const queryClient = useQueryClient()
queryClient.setDefaultOptions({
  queries: {
    staleTime: 1000 * 30, // 30 seconds
  },
})

const wallet: Ref<any> = inject('wallet')!
getCurrentAccount().then(async (account) => {
  if (account) {
    const network = await getNetwork()
    const wif = await getPrivateKey()

    wallet.value = new Wallet(wif, network as API_NET, FEEB, API_TARGET.MVC)
  }
})

const noFooter = computed(() => {
  return route.meta.noFooter
})

const secondaryHeaderTitle = computed(() => {
  return route.meta.headerTitle
})
</script>

<template>
  <div
    id="app"
    class="ext-app relative flex h-150 w-90 items-center justify-center overflow-y-auto font-sans xs:h-screen xs:w-screen xs:bg-gray-200/10"
  >
    <div
      class="ext-app flex h-full w-full flex-col overflow-y-auto xs:relative xs:aspect-[1/2] xs:h-3/4 xs:w-auto xs:min-w-[25rem] xs:rounded-lg xs:border xs:border-gray-100 xs:bg-white xs:shadow-lg"
    >
      <!-- Header -->
      <SecondaryHeader v-if="route.meta.secondaryHeader">
        <template #title>
          {{ secondaryHeaderTitle }}
        </template>
      </SecondaryHeader>

      <TheHeader v-else />

      <!-- bg -->
      <div
        class="bg-hue fixed left-0 top-0 isolate z-[-1] hidden h-1/2 w-full select-none bg-cover bg-center bg-no-repeat xs:block"
      >
        <img class="z-[-1] h-full w-full select-none opacity-100" :src="BgHueImg" alt="bg-hue" />
      </div>
      <div class="isolate grow px-5" :class="noFooter ? 'pb-8' : 'pb-16'">
        <router-view></router-view>
      </div>

      <!-- footer -->
      <TheFooter v-if="!noFooter" />
    </div>
  </div>
</template>

<style scoped lang="css">
.ext-app::-webkit-scrollbar {
  @apply h-1.5 w-1.5;
}

.ext-app::-webkit-scrollbar-track {
  background: transparent;
  @apply rounded-full bg-transparent;
}

.ext-app::-webkit-scrollbar-thumb {
  @apply rounded-full bg-gray-200;
}

.ext-app::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-300;
}
</style>
