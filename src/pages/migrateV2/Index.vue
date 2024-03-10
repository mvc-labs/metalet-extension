<script lang="ts" setup>
import { sleep } from '@/lib/helpers'
import { useRouter } from 'vue-router'
import { getCurrentAccount } from '@/lib/account'
import { migrateV2, needMigrationV2 } from '@/lib/migrate'
import MetaletLogoImg from '@/assets/images/metalet-logo.png?url'

const router = useRouter()
needMigrationV2().then(async (needsMigration: boolean) => {
  if (!needsMigration) {
    return
  }
  await migrateV2()
  await sleep(1000)
  if (await getCurrentAccount()) {
    router.push('/wallet')
  } else {
    router.push('/welcome')
  }
})
</script>

<template>
  <div class="fixed inset-0 w-full h-full bg-white">
    <div class="flex flex-col items-center justify-center h-full">
      <div class="mt-12">
        <img class="mx-auto h-20 w-20" :src="MetaletLogoImg" alt="metalet-logo" />
      </div>
      <div class="text-2xl font-bold mt-16">Migrating to new version...</div>
      <div class="text-lg text-gray-500">Please wait a moment.</div>
    </div>
  </div>
</template>
