<script setup>
import SearchIcon from '@/assets/icons-v3/search.svg'
</script>

<template>
  <div class="relative">
    <SearchIcon class="absolute top-[9px] left-3" />
    <input
      v-model="assetSearch"
      placeholder="Search crypto"
      class="w-full h-10 pl-[42px] bg-gray-secondary rounded-lg p-3 text-ss focus:outline-none placeholder:text-[#BFC2CC]"
    />
  </div>
</template>

<style scoped lang="css"></style>
