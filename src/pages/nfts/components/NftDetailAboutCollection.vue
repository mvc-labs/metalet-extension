<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { ref } from 'vue'

const { collectionInfo } = defineProps<{
  collectionInfo: {
    name: string
    description: string
    totalSupply: string
  }
}>()
</script>

<template>
  <Disclosure v-slot="{ open }">
    <DisclosureButton class="flex items-center gap-2  text-gray-700 hover:underline">
      {{ `About ${collectionInfo.name}` }}
      <ChevronDownIcon
        :class="['h-5 w-5 transition duration-300', open ? 'rotate-180 text-gray-700' : 'text-gray-300']"
      />
    </DisclosureButton>

    <DisclosurePanel class="mt-2 text-sm text-gray-500">
      {{ collectionInfo.description }}
    </DisclosurePanel>
  </Disclosure>
</template>
