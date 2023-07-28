<script lang="ts" setup>
import { computed, ref } from 'vue'
import MetaletLogoImg from '@/assets/images/metalet-logo.png?url'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'
import passwordManager from '@/lib/password'
import { useRouter } from 'vue-router'

const router = useRouter()

const isCovered = ref(true)
const passwordInputType = computed(() => (isCovered.value ? 'password' : 'text'))
const password = ref('')

const failed = ref(false)
const tryUnlock = async () => {
  // 检验输入的密码是否正确
  const isCorrect = await passwordManager.check(password.value)
  if (isCorrect) {
    // 如果正确，解锁
    await passwordManager.unlock(password.value)
    // 跳转到钱包页面
    router.push('/wallet')
  } else {
    // 如果不正确，提示密码错误
    failed.value = true
  }
}
</script>

<template>
  <div class="mt-12">
    <div class="">
      <img class="mx-auto h-20 w-20" :src="MetaletLogoImg" alt="metalet-logo" />
    </div>

    <div class="mt-4 text-center">
      <h1 class="text-3xl font-extrabold">Metalet</h1>
      <p class="mt-2 text-lg text-gray-400">Welcome Back</p>
    </div>

    <div class="mt-12">
      <h4 class="mb-2 text-sm">Password</h4>
      <div class="relative">
        <input
          :type="passwordInputType"
          class="w-full rounded-md border bg-gray-100 p-4 pr-12 text-sm text-gray-700"
          :class="failed ? 'border-red-500' : 'border-transparent'"
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

    <div class="mt-4">
      <button class="gradient-bg w-full rounded-md py-4 text-base leading-none text-white" @click="tryUnlock">
        Unlock
      </button>
    </div>

    <div class="mt-2" v-if="failed">
      <p class="text-sm text-red-500">Password is incorrect</p>
    </div>
  </div>
</template>
