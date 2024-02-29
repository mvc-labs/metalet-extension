<script setup>
import { ref } from 'vue'
import NO_NFT_DATA from './NoNFTData.vue'
import SelectorIcon from '@/assets/icons-v3/selector.svg'

const selector = ref('MetaContract')
</script>

<template>
  <div>
    <div class="py-3 text-sm flex items-center gap-2 cursor-pointer" v-if="false">
      <span>{{ selector }}</span>

      <SelectorIcon />
    </div>
    <NO_NFT_DATA />
  </div>
</template>

<style scoped lang="css"></style>
