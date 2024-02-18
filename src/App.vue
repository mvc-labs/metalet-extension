<script setup lang="ts">
import { FEEB } from './data/config'
import useStorage from '@/lib/storage'
import { getNetwork } from './lib/network'
import { computed, Ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import BgHueImg from './assets/images/bg-hue.png?url'
import TheFooter from './components/the-footer/Index.vue'
import TheHeader from './components/headers/TheHeader.vue'
import { API_NET, API_TARGET, Wallet } from 'meta-contract'
import { getCurrentAccount, getPrivateKey } from './lib/account'
import SecondaryHeader from './components/headers/SecondaryHeader.vue'
import {
  migrateV2,
  migrationSync,
  needMigrationV2,
  ACCOUNT_V2_Migrated_KEY,
  ACCOUNT_Sync_Migrated_KEY,
} from '@/lib/migrate'

const route = useRoute()
const router = useRouter()
const storage = useStorage()

const queryClient = useQueryClient()
queryClient.setDefaultOptions({
  queries: {
    staleTime: 1000 * 30, // 30 seconds
  },
})

const noFooter = computed(() => {
  return route.meta.noFooter
})

const secondaryHeaderTitle = computed(() => {
  return route.meta.headerTitle
})

async function checkMigrate() {
  if (!(await storage.get(ACCOUNT_Sync_Migrated_KEY))) {
    const result= await migrationSync()
  }
  if (!(await storage.get(ACCOUNT_V2_Migrated_KEY)) && (await needMigrationV2())) {
   await migrateV2()
    await storage.set(ACCOUNT_V2_Migrated_KEY, true)
  }
}

const wallet: Ref<any> = inject('wallet')!
checkMigrate().then(async () => {
  const currentAccout = await getCurrentAccount()
  if (currentAccout) {
    const network = await getNetwork()
    const wif = await getPrivateKey()
    wallet.value = new Wallet(wif, network as API_NET, FEEB, API_TARGET.MVC)
    router.push('/wallet')
  } else {
    router.push('/welcome')
  }
})
</script>

<template>
  <div id="app"
    class="ext-app relative flex h-150 w-90 items-center justify-center overflow-y-auto xs:h-screen xs:w-screen xs:bg-gray-200/10 font-sans">
    <div
      class="ext-app flex h-full w-full flex-col xs:relative xs:aspect-[1/2] xs:h-3/4 xs:w-auto xs:min-w-[25rem] xs:rounded-lg xs:border xs:border-gray-100 xs:bg-white xs:shadow-lg">
      <!-- Header -->
      <SecondaryHeader v-if="route.meta.secondaryHeader">
        <template #title>
          {{ secondaryHeaderTitle }}
        </template>
      </SecondaryHeader>

      <TheHeader v-else />

      <!-- bg -->
      <div
        class="fixed left-0 top-0 isolate z-[-1] hidden h-1/2 w-full select-none bg-cover bg-center bg-no-repeat xs:block">
        <img class="z-[-1] h-full w-full select-none opacity-100" :src="BgHueImg" alt="bg-hue" />
      </div>
      <div class="isolate grow px-5 overflow-y-auto nicer-scrollbar" :class="noFooter ? 'pb-8' : 'pb-16'">
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
  @apply rounded-full bg-transparent;
}

.ext-app::-webkit-scrollbar-thumb {
  @apply rounded-full bg-gray-200;
}

.ext-app::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-300;
}
</style>
