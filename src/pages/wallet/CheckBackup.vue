<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { type Account, getCurrentAccount } from '@/lib/account'

const router = useRouter()

const mnemonic = ref('')
const isValid = ref(true)

const account = ref<Account | null>(null)
getCurrentAccount().then((acc) => {
  account.value = acc
})

const verify = async () => {
  if (!account.value) {
    router.push('/welcome')
    return
  }

  // 检查输入的助记词是否正确
  const mnemonicStr = mnemonic.value
  if (mnemonicStr !== account.value!.mnemonic) {
    isValid.value = false
    return
  }

  // 跳转至后续
  router.push('/wallet/create-success')
}
</script>

<template>
  <div class="-mb-8 pt-4">
    <h3 class="text-center text-lg ">Check Backup</h3>

    <p class="pt-2 text-center text-sm text-gray-500">
      Write down your seed phrase to make sure you have backed up your wallet.
    </p>

    <textarea
      name=""
      rows="5"
      class="mt-8 w-full resize-none rounded-md border bg-gray-100 p-4"
      :class="isValid ? 'border-transparent' : 'border-red-500'"
      v-model="mnemonic"
    ></textarea>
    <p v-if="!isValid" class="mt-2 text-sm text-red-500">The seed phrase you entered is incorrect.</p>

    <!-- buttons -->
    <div class="mt-24 grid grid-cols-2 gap-x-2">
      <button class="rounded-md border border-primary-blue py-4 text-base leading-none" @click="router.back()">
        Back
      </button>
      <button class="gradient-bg rounded-md py-4 text-base leading-none text-white" @click="verify">Verify</button>
    </div>
  </div>
</template>
