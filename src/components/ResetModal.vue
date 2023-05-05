<script lang="ts" setup>
import { XMarkIcon } from '@heroicons/vue/20/solid'
import accountManager from '../lib/account'
import passwordManager from '../lib/password'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'

const router = useRouter()

const props = defineProps<{
  show: boolean
}>()
const emit = defineEmits(['update:show'])

const isCovered = ref(true)
const passwordInputType = computed(() => (isCovered.value ? 'password' : 'text'))
const password = ref('')
const failed = ref(false)

const disconnect = async () => {
  // 检查密码是否正确
  const isCorrect = await passwordManager.check(password.value)
  if (!isCorrect) {
    failed.value = true
    return
  }

  await accountManager.removeCurrent()

  emit('update:show', false)

  // 返回账号列表页
  router.push('/accounts')
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 isolate z-50 flex items-end bg-black/20 backdrop-blur-sm" v-show="show">
      <div class="grow rounded-t-xl bg-white p-4 pb-8">
        <div class="flex items-center justify-between border-b border-gray-100 pb-4">
          <span class="text-base font-bold">Reset Account</span>
          <button class="text-gray-400 hover:text-gray-500" @click="$emit('update:show', false)" type="button">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="pt-4">
          <p class="text-sm text-gray-500">
            This action will reset your current account from Metalet. Make sure you have your seed phrase backed up.
          </p>
          <p class="mt-1 text-sm text-gray-500">You have to enter your password to confirm this action.</p>

          <div class="relative mt-4">
            <input
              :type="passwordInputType"
              class="w-full rounded-md border bg-gray-100 p-4 pr-12 text-sm text-gray-700"
              :class="failed ? 'border-red-500' : 'border-transparent'"
              v-model="password"
              placeholder="Password"
            />

            <div class="absolute right-0 top-0 flex h-full items-center pr-4">
              <button class="" @click="isCovered = !isCovered">
                <EyeIcon v-if="isCovered" class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
              </button>
            </div>
          </div>

          <div class="mt-2" v-if="failed">
            <p class="text-sm text-red-500" v-if="failed">Password is incorrect</p>
          </div>

          <div class="mt-8 grid grid-cols-2 gap-x-4">
            <button class="reset-button border-gray-700 text-gray-700" @click="$emit('update:show', false)">
              Cancel
            </button>
            <button
              class="reset-button border-red-600 bg-red-600 text-red-50"
              :class="[password.length ? 'cursor-pointer' : 'cursor-not-allowed opacity-50 saturate-50']"
              @click="disconnect"
              :disabled="!password.length"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="css">
.reset-button {
  @apply rounded-lg border-2 py-3 text-sm font-bold;
}
</style>
