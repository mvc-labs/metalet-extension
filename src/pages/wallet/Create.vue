<script lang="ts" setup>
import { Ref, computed, ref } from 'vue'
import { mvc } from 'meta-contract'
import { EyeIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'

import LockIcon from '@/assets/icons/lock.svg?component'
import { addAccount } from '@/lib/account'
import { deriveAllAddresses, type AddressType } from '@/lib/bip32-deriver'

const router = useRouter()

const words: Ref<string[]> = ref(Array(12).fill(''))
const wordsDisplay = computed(() => words.value.join(' '))

// 随机生成助记词
const generateMnemonic = () => {
  const mnemonic = mvc.Mnemonic.fromRandom()
  words.value = mnemonic.toString().split(' ')
}
generateMnemonic()

// 遮掩
const isCover = ref(true)

// 保存账号
const saveAccount = async (backup: boolean) => {
  const mnemonicStr = words.value.join(' ')
  try {
    const fullPath = `m/44'/10001'/0'/0/0`
    const btcPath = fullPath

    const allAddresses = deriveAllAddresses({
      mnemonic: mnemonicStr,
      btcPath,
      mvcPath: fullPath,
    })

    // construct new account object
    const account = {
      mnemonic: mnemonicStr,
      assetsDisplay: ['SPACE', 'BTC'],
      mvc: {
        path: fullPath,
        addressType: 'P2PKH' as AddressType,
        mainnetAddress: allAddresses.mvcMainnetAddress,
        testnetAddress: allAddresses.mvcTestnetAddress,
      },
      btc: {
        path: btcPath,
        addressType: 'P2PKH' as AddressType,
        mainnetAddress: allAddresses.btcMainnetAddress,
        testnetAddress: allAddresses.btcTestnetAddress,
      },
    }
    await addAccount(account)

    console.log('addAccount')
    console.log('backup', backup)

    if (!backup) {
      console.log('goto successs')
      router.push('/wallet/create-success')
    } else {
      router.push('/wallet/check-backup')
    }
  } catch (e) {
    console.log(e)
  }
}
</script>

<template>
  <div class="mt-8">
    <div class="flex items-center justify-center">
      <LockIcon class="h-14 w-12 text-black" />
    </div>

    <h3 class="mt-4 text-center text-xl">Back up your Seed Phrase</h3>

    <p class="mt-2 text-center text-sm text-gray-400">
      Your seed phrase is the unique key that allows you to recover your wallet.
    </p>

    <!-- seed phrase -->
    <div class="relative">
      <div class="mt-8 rounded-lg bg-gray-100 px-3 py-4 text-lg leading-loose">
        {{ wordsDisplay }}
      </div>

      <div
        class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-100/30 backdrop-blur"
        v-if="isCover"
      >
        <button
          class="w- flex w-32 items-center justify-center gap-x-2 rounded-full border border-black py-2"
          @click="isCover = false"
        >
          <EyeIcon class="h-5 w-5" />
          <span>Show</span>
        </button>
      </div>
    </div>

    <!-- buttons -->
    <div class="mt-24 grid grid-cols-2 gap-x-2">
      <button class="rounded-md border border-primary-blue py-4 text-base leading-none" @click="saveAccount(false)">
        Backup Later
      </button>
      <button class="gradient-bg rounded-md py-4 text-base leading-none text-white" @click="saveAccount(true)">
        Next
      </button>
    </div>
  </div>
</template>
