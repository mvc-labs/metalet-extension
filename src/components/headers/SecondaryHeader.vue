<script lang="ts" setup>
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="grid grid-cols-5 items-center text-gray-900 p-4">
    <!-- back arrow -->
    <div class="col-span-1 flex items-center">
      <button @click="router.back()">
        <ChevronLeftIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- title -->
    <div class="col-span-3 justify-self-center text-sm font-bold">
      <slot name="title"></slot>
    </div>
  </div>
</template>
