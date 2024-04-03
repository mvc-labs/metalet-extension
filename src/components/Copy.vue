<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import CopyIcon from '@/assets/icons/copy.svg'
import { ClipboardStore } from '@/stores/ClipboardStore'

const { text } = defineProps<{
  text: string
}>()
</script>

<template>
  <CopyIcon
    @click="ClipboardStore.copy(text)"
    :class="
      twMerge(
        'hover:text-blue-primary cursor-pointer',
        $attrs.class as string,
        ClipboardStore.copiedText === text ? 'text-blue-primary' : 'text-gray-primary'
      )
    "
  />
</template>
