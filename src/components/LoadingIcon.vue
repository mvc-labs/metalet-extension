<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import LoadingIcon from '@/assets/icons/loading.svg'
</script>

<template>
  <LoadingIcon :class="twMerge('h-5 w-5 text-gray-primary', $attrs.class as string)" />
</template>
