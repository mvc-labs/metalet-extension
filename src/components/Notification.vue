<script lang="ts" setup>
import { TransitionRoot } from '@headlessui/vue'
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { inject, Ref, watch } from 'vue'

withDefaults(
  defineProps<{
    type?: 'success' | 'error'
    title: string
    content?: string
  }>(),
  {
    type: 'success',
  }
)

const notifying = inject<Ref<boolean>>('notifying')!
const close = () => {
  //   // 销毁组件
  notifying.value = false
}

// // 3s 后自动关闭
watch(
  () => notifying.value,
  (value) => {
    if (value) {
      setTimeout(() => {
        close()
      }, 3000)
    }
  }
)
</script>

<template>
  <TransitionRoot
    :show="notifying"
    enter="transition-opacity duration-75"
    enter-from="opacity-0"
    enter-to="opacity-100"
    leave="transition-opacity duration-150"
    leave-from="opacity-100"
    leave-to="opacity-0"
    class="fixed right-4 top-4 z-50"
  >
    <!-- a floating notification -->
    <div class="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <div class="flex gap-x-2" :class="[!!content ? 'items-start' : 'items-center']">
        <!-- Icons -->
        <CheckCircleIcon class="h-6 w-6 text-green-500" v-if="type === 'success'" />
        <ExclamationCircleIcon class="h-6 w-6 text-red-500" v-else />

        <div class="">
          <div class="text-sm font-semibold text-gray-900">{{ title }}</div>
          <div class="text-xs text-gray-500">{{ content }}</div>
        </div>

        <!-- close -->
        <div class="ml-2 self-stretch">
          <button @click="close">
            <XMarkIcon class="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  </TransitionRoot>
</template>
