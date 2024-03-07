<script setup lang="ts">
const { type } = defineProps<{ type: 'primary' | 'light' }>()
</script>

<template>
  <button :class="`btn-${type}`">
    <slot />
  </button>
</template>

<style scoped lang="css">
button {
  @apply flex items-center justify-center rounded-3xl text-ss;
}

.btn-light {
  @apply bg-blue-light text-blue-primary;
}

.btn-primary {
  @apply bg-blue-primary text-white;
}
</style>
