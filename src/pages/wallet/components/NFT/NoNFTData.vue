<script setup>
import NO_NFT_DATA_PNG from '@/assets/icons-v3/nft_no_data.png'
</script>

<template>
  <div class="mt-[60px] w-full flex flex-col items-center justify-center">
    <img :src="NO_NFT_DATA_PNG" alt="No NFT data" />
    <span class="text-gray-primary text-sm mt-4">No NFTs currently. Turn to the marketplace.</span>
    <button class="bg-blue-primary text-white py-2 px-6 mt-9 rounded-[17px]">Explore NFT</button>
  </div>
</template>

<style scoped lang="css"></style>
