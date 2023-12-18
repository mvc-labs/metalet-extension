<script lang="ts" setup>
import { CheckIcon } from '@heroicons/vue/20/solid'
import passwordManager from '@/lib/password'
import { useRouter } from 'vue-router'

const router = useRouter()

const goOn = async () => {
  // 查询有否设置密码
  const hasPassword = await passwordManager.has()
  const following = hasPassword ? '/wallet' : '/wallet/set-password'
  router.push(following)
}
</script>

<template>
  <div class="mt-32 flex flex-col items-center justify-center">
    <div class="gradient-bg flex h-16 w-16 items-center justify-center rounded-full !bg-gradient-to-br">
      <CheckIcon class="h-8 w-8 text-white" />
    </div>

    <h3 class="mt-6 text-xl">Wallet created successfully</h3>
    <p class="mt-3 text-center text-sm leading-loose text-gray-400">
      Your new wallet has been created successfully, you can now connect to your wallet.
    </p>

    <div class="mt-32 flex self-stretch">
      <button class="main-btn-bg grow rounded-md py-4 text-center leading-none text-white" @click="goOn">OK</button>
    </div>
  </div>
</template>
