<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Switch } from '@headlessui/vue'
import { createEmit } from '@/lib/emitters'
// import { addAssetsDisplay, getAssetsDisplay, removeAssetsDisplay } from '@/lib/assets'

const props = defineProps<{
  asset: {
    symbol: string
    logo: string
    tokenName: string
  }
}>()

const enabled = ref(false)
const initializing = ref(true)
// getAssetsDisplay().then((assets) => {
//   enabled.value = assets.includes(props.asset.symbol)
//   initializing.value = false
// })
createEmit<string[]>('getAssetsDisplay')().then((assets) => {
  enabled.value = assets.includes(props.asset.symbol)
  initializing.value = false
})

// 观察enabled的变化，toggle的时候，打印出来
watch(enabled, async (value) => {
  if (initializing.value) return

  if (value) {
    // 保存至显示列表
    // await addAssetsDisplay(props.asset.symbol)
    await createEmit('addAssetsDisplay')(props.asset.symbol)
  } else {
    // 从显示列表中删除
    // await removeAssetsDisplay(props.asset.symbol)
    await createEmit('removeAssetsDisplay')(props.asset.symbol)
  }
})
</script>

<template>
  <div class="flex items-center justify-between rounded px-4 py-6">
    <div class="flex items-center gap-x-3">
      <img class="h-10 w-10 rounded-full" :src="asset.logo" />
      <div class="flex flex-col">
        <div class="text-base">{{ asset.tokenName }}</div>
        <div class="text-xs text-gray-500">{{ asset.symbol }}</div>
      </div>
    </div>

    <!-- toggle -->
    <Switch
      v-model="enabled"
      :class="enabled ? 'bg-primary-blue' : 'bg-gray-50 shadow-inner'"
      class="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
    >
      <span
        aria-hidden="true"
        :class="enabled ? 'translate-x-6' : 'translate-x-0'"
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
      />
    </Switch>
  </div>
</template>
