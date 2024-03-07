<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { w } = defineProps<{ w?: number }>()
</script>

<template>
  <div :class="w ? (w === 1 ? 'border-t' : `border-t-${w}`) : 'border-t'"></div>
</template>

<style scoped lang="css"></style>
