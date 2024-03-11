<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { w, dashed } = defineProps<{
  w?: number
  dashed?: boolean
}>()
</script>

<template>
  <div
    :class="[w ? (w === 1 ? 'border-t' : `border-t-${w}`) : 'border-t', dashed ? 'border-dashed' : 'border-solid']"
  ></div>
</template>

<style scoped lang="css"></style>
