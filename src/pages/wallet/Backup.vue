<script lang="ts" setup>
import { Ref, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'
import PasswordImg from '@/assets/images/password.svg?url'
import passwordManager from '@/lib/password'
import { account } from '@/lib/account'

const router = useRouter()

const phase: Ref<1 | 2> = ref(1)
const isCovered = ref(true)
const passwordInputType = computed(() => (isCovered.value ? 'password' : 'text'))
const password = ref('')
const failed = ref(false)

const isCoveredMne = ref(true)
const mne = computed(() => account.value?.mnemonic)

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
    const isCorrect = await passwordManager.check(password.value)
    if (isCorrect) {
      // 如果正确，进入下一步
      phase.value = 2
    } else {
      // 如果不正确，提示密码错误
      failed.value = true
      return
    }
  } else {
    // 如果是第二步，进入首页
    router.push('/wallet')
  }
}
</script>

<template>
  <div class="flex h-full flex-col pt-4">
    <div class="grow">
      <template v-if="phase === 1">
        <img :src="PasswordImg" class="mx-auto h-7 w-9" />
        <h3 class="mt-4 text-center text-lg font-bold">Password Security</h3>
        <p class="mt-2 text-center text-sm text-gray-500">Make sure no one can see your screen.</p>

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

        <div class="mt-2" v-if="failed">
          <p class="text-sm text-red-500" v-if="failed">Password is incorrect</p>
        </div>
      </template>

      <template v-if="phase === 2">
        <div class="mt-12">
          <p class="text-center text-sm text-gray-500">
            Write down your seed phrase and make sure to keep it private. This is the unique key to your wallet.
          </p>
        </div>

        <div class="mt-8">
          <h4>Seedphrase</h4>

          <!-- seed phrase -->
          <div class="relative mt-2">
            <div class="rounded-lg bg-gray-100 px-3 py-4 text-lg leading-loose">
              {{ mne }}
            </div>

            <div
              class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-100/30 backdrop-blur"
              v-if="isCoveredMne"
            >
              <button
                class="w- flex w-32 items-center justify-center gap-x-2 rounded-full border border-black py-2"
                @click="isCoveredMne = false"
              >
                <EyeIcon class="h-5 w-5" />
                <span>Show</span>
              </button>
            </div>
          </div>
        </div>

        <!-- path -->
        <div class="mt-8" v-if="account">
          <h4>Derivation Path</h4>
          <div class="mt-2">
            <div class="rounded-lg bg-gray-100 px-3 py-2 text-sm leading-loose">{{ `m/44'/${account.path}'/0'` }}</div>
          </div>
        </div>
      </template>
    </div>

    <!-- buttons -->
    <div class="grid grid-cols-2 gap-x-2">
      <button class="rounded-md border border-primary-blue py-4 text-base leading-none" @click="back">Back</button>
      <button
        class="gradient-bg rounded-md py-4 text-base leading-none text-white"
        :class="!password && 'opacity-50 saturate-50'"
        :disabled="!password"
        @click="next"
      >
        Next
      </button>
    </div>
  </div>
</template>
