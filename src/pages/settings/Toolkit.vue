<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ChevronRightIcon } from '@heroicons/vue/20/solid'

const router = useRouter()

const toBTCMerge = () => {
  router.push('/settings/toolkit/btc-merge')
}

const toSpaceMerge = () => {
  router.push('/settings/toolkit/space-merge')
}
</script>

<template>
  <div class="space-y-8 pt-4 text-sm">
    <!-- security -->
    <div class="space-y-2">
      <div class="text-base">BTC</div>
      <div class="divide-y divide-gray-100">
        <div class="setting-item group cursor-pointer" @click="toBTCMerge">
          <div class="text-gray-500 group-hover:underline">BTC Merge</div>
          <div class="">
            <ChevronRightIcon class="link-icon" />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-base">MVC</div>
      <div class="divide-y divide-gray-100">
        <div class="setting-item group cursor-pointer" @click="toSpaceMerge">
          <div class="text-gray-500 group-hover:underline">Space Merge</div>
          <div class="">
            <ChevronRightIcon class="link-icon" />
          </div>
        </div>

        <div class="setting-item group cursor-pointer" @click="$router.push('/settings/toolkit/ft-merge')">
          <div class="text-gray-500 group-hover:underline">FT Merge</div>
          <div class="">
            <ChevronRightIcon class="link-icon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.setting-item {
  @apply -mx-2 flex items-center justify-between px-2 py-4 transition-all duration-200 ease-in-out hover:bg-gray-300/20;
}

.link-icon {
  @apply h-4 w-4 text-gray-500 group-hover:text-blue-500;
}
</style>
