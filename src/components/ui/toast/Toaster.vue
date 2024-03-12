<script setup lang="ts">
import { isVNode } from 'vue'
import { useToast } from './use-toast'
import SuccessIcon from '@/assets/icons-v3/sucess.svg'
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '.'

const { toasts } = useToast()
</script>

<template>
  <ToastProvider>
    <Toast v-for="toast in toasts" :key="toast.id" v-bind="toast" class="py-3.5 px-4 bg-white rounded-xl">
      <div class="grid gap-1">
        <ToastTitle v-if="toast.title" class="flex items-center gap-x-2">
          <template v-if="toast.toastType === 'success'">
            <SuccessIcon class="flex-shrink-0"/>
          </template>
          <span class="break-all">{{ toast.title }}</span>
        </ToastTitle>
        <template v-if="toast.description">
          <ToastDescription v-if="isVNode(toast.description)">
            <component :is="toast.description" />
          </ToastDescription>
          <ToastDescription v-else>
            {{ toast.description }}
          </ToastDescription>
        </template>
        <ToastClose />
      </div>
      <component :is="toast.action" />
    </Toast>
    <ToastViewport />
  </ToastProvider>
</template>
