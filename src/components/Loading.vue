<script setup lang="ts">
const { text } = defineProps<{
  text: string
}>()
</script>

<template>
  <div class="w-full py-12 text-center text-sm font-bold text-gray-500">{{ text }}</div>
</template>

<style scoped lang="css"></style>
