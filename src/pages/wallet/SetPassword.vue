<script lang="ts" setup>
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'
import PasswordImg from '@/assets/images/password.svg?url'
import { Ref, computed, ref } from 'vue'
import { passwordStrength } from 'check-password-strength'
import { useRouter } from 'vue-router'
// import accountManager from '@/lib/account'
import passwordManager from '@/lib/password'

const router = useRouter()

const phase: Ref<1 | 2> = ref(1)

const isCovered = ref(true)
const passwordInputType = computed(() => (isCovered.value ? 'password' : 'text'))
const password = ref('')
const confirmPassword = ref('')
const isExact = ref(true)

// enum SecurityLevel {
//   TooWeak = 'Too weak',
//   Weak = 'Weak',
//   Medium = 'Medium',
//   Strong = 'Strong',
// }
// const barLength = computed(() => {
//   switch (securityLevel.value) {
//     case SecurityLevel.TooWeak:
//       return 10
//     case SecurityLevel.Weak:
//       return 33
//     case SecurityLevel.Medium:
//       return 66
//     case SecurityLevel.Strong:
//       return 100
//   }
// })
// const securityLevel = computed(() => {
//   return passwordStrength(password.value).value as SecurityLevel
// })
const canPass = computed(() => {
  return password.value.length >= 8
})

// 按钮
const back = () => {
  if (phase.value === 1) {
    router.back()
  } else {
    phase.value = 1
  }
}

const next = async () => {
  if (phase.value === 1) {
    phase.value = 2
  } else {
    // 检查两次密码是否一致
    if (password.value !== confirmPassword.value) {
      isExact.value = false
      return
    }

    // 保存密码到账号
    await passwordManager.set(password.value)

    // 重载
    router.push('/wallet')
  }
}
</script>

<template>
  <div class="flex h-full flex-col pt-4">
    <div class="grow">
      <img :src="PasswordImg" class="mx-auto h-7 w-9" />
      <template v-if="phase === 1">
        <h3 class="mt-4 text-center text-lg ">Set Password</h3>

        <div class="mt-16">
          <h4 class="mb-2 text-sm">Password</h4>
          <div class="relative">
            <input
              :type="passwordInputType"
              class="w-full rounded-md bg-gray-100 p-4 pr-12 text-sm text-gray-700"
              v-model="password"
            />
            <div class="absolute right-0 top-0 flex h-full items-center pr-4">
              <button class="" @click="isCovered = !isCovered">
                <EyeIcon v-if="isCovered" class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- securityLevel -->
        <!-- <div class="mt-4 flex items-center justify-between">
          <div class="flex grow items-center justify-start gap-x-4">
            <span class="text-sm text-gray-500">Security level</span>
            <div class="relative h-2 grow rounded-full bg-gray-200">
              <div
                :class="[
                  securityLevel === SecurityLevel.TooWeak ? 'bg-red-500' : '',
                  securityLevel === SecurityLevel.Weak ? 'bg-red-500' : '',
                  securityLevel === SecurityLevel.Medium ? 'bg-yellow-500' : '',
                  securityLevel === SecurityLevel.Strong ? 'bg-green-500' : '',
                  'absolute left-0 top-0 h-full rounded-full transition-all',
                ]"
                :style="{
                  width: `${barLength}%`,
                }"
              ></div>
            </div>
          </div>

          <div class="w-20 text-right text-sm">{{ securityLevel }}</div>
        </div> -->

        <!-- security level tip -->
        <p class="mt-4 text-xs text-gray-400">Passwords must be at least 8 characters in length.</p>
      </template>

      <template v-if="phase === 2">
        <h3 class="mt-4 text-center text-lg ">Confirm Password</h3>

        <div class="mt-16">
          <h4 class="mb-2 text-sm">Password</h4>
          <div class="relative">
            <input
              :type="passwordInputType"
              class="w-full rounded-md border bg-gray-100 p-4 pr-12 text-sm text-gray-700"
              :class="isExact ? 'border-transparent' : 'border-red-500'"
              v-model="confirmPassword"
            />
            <div class="absolute right-0 top-0 flex h-full items-center pr-4">
              <button class="" @click="isCovered = !isCovered">
                <EyeIcon v-if="isCovered" class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
              </button>
            </div>
          </div>
          <p class="mt-2 text-sm text-red-500" v-if="!isExact">Passwords do not match</p>
        </div>
      </template>
    </div>

    <!-- buttons -->
    <div class="grid grid-cols-2 gap-x-2">
      <button class="rounded-md border border-primary-blue py-4 text-base leading-none" @click="back">Back</button>
      <button
        class="gradient-bg rounded-md py-4 text-base leading-none text-white"
        :class="!canPass && 'opacity-50 saturate-50'"
        :disabled="!canPass"
        @click="next"
      >
        Next
      </button>
    </div>
  </div>
</template>
