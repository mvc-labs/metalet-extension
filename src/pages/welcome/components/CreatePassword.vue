<script lang="ts" setup>
import { ref, computed } from 'vue'
import passwordManager from '@/lib/password'
import { FlexBox, Button } from '@/components'
import { Checkbox } from '@/components/ui/checkbox'
import SuccessPNG from '@/assets/icons-v3/send-success.png'
import ArrowLeftIcon from '@/assets/icons-v3/arrow-left.svg'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'

const { callback } = defineProps<{ callback?: Function }>()

const error = ref()
const password = ref()
const checked = ref(false)
const isCovered = ref(true)
const confirmPassword = ref()
const isConfirmCovered = ref(true)
const passwordInputType = computed(() => (isCovered.value ? 'password' : 'text'))
const passwordConfirmInputType = computed(() => (isConfirmCovered.value ? 'password' : 'text'))
const btnDisabled = computed(
  () => !checked.value || !password.value || password.value.length < 8 || !confirmPassword.value
)

const submit = async () => {
  error.value = undefined
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Password does not match.'
    return
  }

    await passwordManager.set(password.value)
  callback && callback()
}
</script>

<template>
  <FlexBox ai="center" :gap="3">
    <ArrowLeftIcon @click="$router.go(-1)" class="cursor-pointer" />
    <div class="text-2xl font-medium">Create Password</div>
  </FlexBox>
  <p class="mt-2 text-sm text-gray-primary"
    >This password only unlocks your Metalet wallet on this device. Metalet cannot recover it for you.</p
  >
  <FlexBox d="col" class="mt-9 gap-y-6">
    <div class="space-y-2">
      <!-- TODO: Identify password strength -->
      <h4 class="mb-2 text-sm">New password (min. 8 characters)</h4>
      <div class="relative">
        <input
          v-model="password"
          :type="passwordInputType"
          class="w-full rounded-md py-3.5 px-4 pr-5 border border-gray-soft focus:outline-none"
        />
        <div class="absolute right-0 top-0 flex h-full items-center pr-4">
          <button class="" @click="isCovered = !isCovered">
            <EyeIcon v-if="!isCovered" class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
          </button>
        </div>
      </div>
    </div>
    <div class="space-y-2">
      <h4 class="mb-2 text-sm">Confirm password</h4>
      <div class="relative">
        <input
          v-model="confirmPassword"
          :type="passwordConfirmInputType"
          class="w-full rounded-md py-3.5 px-4 pr-5 border border-gray-soft focus:outline-none"
        />
        <div class="absolute right-0 top-0 flex h-full items-center pr-4">
          <button class="" @click="isConfirmCovered = !isConfirmCovered">
            <EyeIcon v-if="!isConfirmCovered" class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 transition hover:text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  </FlexBox>
  <FlexBox d="col" ai="center" jc="center" class="mt-16" :gap="4">
    <FlexBox ai="center" :gap="1.5">
      <Checkbox id="terms" v-model:checked="checked" />
      <span class="text-slate-light"
        >I agree to Metlet's <a href="javascript:void(0)" class="text-blue-primary">Terms of use</a></span
      ></FlexBox
    >
    <Button
      type="primary"
      @click="submit"
      :disabled="btnDisabled"
      :class="['w-61.5', btnDisabled ? 'opacity-50' : undefined]"
      >Confirm</Button
    >
    <div class="mt-4 text-center text-sm text-red-500" v-if="error">{{ error }}</div>
  </FlexBox>
</template>
