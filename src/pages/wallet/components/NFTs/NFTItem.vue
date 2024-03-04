<script setup lang="ts">
const { nftItem } = defineProps<{
  nftItem: {
    id: string
    title: string
    desc: string
    imgUrl?: string
    content?: string
  }
}>()
</script>

<template>
  <div class="cursor-pointer">
    <img v-if="nftItem.imgUrl" :src="nftItem.imgUrl" class="w-full aspect-square rounded-md" />
    <div
      v-else
      class="break-all p-2 w-full aspect-square flex items-center justify-center text-xs bg-gray-light rounded-md"
    >
      {{ nftItem.content }}
    </div>

    <div class="text-sm mt-1.5 truncate text-center">{{ nftItem.title }}</div>
    <div class="text-xs truncate text-gray-primary text-center">{{ nftItem.desc }}</div>
  </div>
</template>

<style scoped lang="css"></style>
