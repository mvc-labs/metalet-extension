<script lang="ts" setup>
import { allAssets } from '@/data/assets'
import AssetSelect from './components/AssetSelect.vue'
</script>

<template>
  <div class="divide-y divide-gray-100 text-black">
    <!--列表，里面有btc，mvc -->
    <AssetSelect v-for="asset in allAssets" :key="asset.symbol" :asset="asset" />
  </div>
</template>
