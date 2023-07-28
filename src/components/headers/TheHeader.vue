<script lang="ts" setup>
import { useRoute } from 'vue-router'

import MetaletLogoImg from '@/assets/images/metalet-logo.png?url'
import MetaletWordImg from '@/assets/images/metalet-word.svg?url'
import AccountMenu from './AccountMenu.vue'
import { VERSION } from '@/data/config'

const route = useRoute()
</script>

<template>
  <div class="flex items-center justify-between p-4">
    <div class="flex items-center justify-start gap-x-2">
      <div class="flex items-center gap-x-2">
        <img class="h-7 w-7" :src="MetaletLogoImg" alt="metalet-logo" />
        <img class="h-4" :src="MetaletWordImg" alt="metalet" />
      </div>

      <span class="text-sm">V{{ VERSION }}</span>
    </div>

    <div class="">
      <AccountMenu v-if="!route.meta.noMenu" />
    </div>
  </div>
</template>
