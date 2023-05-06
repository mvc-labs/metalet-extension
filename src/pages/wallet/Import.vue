<script lang="ts" setup>
import { ref, computed, Ref, watch } from 'vue'
import { mvc } from 'meta-contract'
import { addAccount } from '../../lib/account'
import { useRouter } from 'vue-router'
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'

import MetaletLogoImg from '../../assets/images/metalet-logo.png?url'
import { TrashIcon } from '@heroicons/vue/20/solid'

const router = useRouter()

// 12/24个单词
const wordsLengths = [12, 24]
const selectedWordsLength = ref(12)
watch(
  () => selectedWordsLength.value,
  () => {
    clearWords()
    words.value = Array(selectedWordsLength.value).fill('')
  }
)
const words: Ref<string[]> = ref(Array(selectedWordsLength.value).fill(''))

const wordsDisplay = computed(() => words.value.join(' '))
const clearWords = () => {
  words.value = Array(selectedWordsLength.value).fill('')
}
const onPasteWords = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text')
  if (text) {
    const wordsArr = text.split(' ')
    if (wordsArr.length === selectedWordsLength.value) {
      words.value = wordsArr
    } else {
      error.value = 'Invalid secret phrase. Please check and try again.'
    }
  }
}

const paths = ['10001', '236']
const selectedPath = ref('10001')

const finished = computed(() => words.value.every((word) => word.length > 0))

const error = ref('')
const onSubmit = async () => {
  if (!finished.value) return false

  // 拼接助记词
  const mnemonicStr = words.value.join(' ')

  // 转化成私钥
  try {
    const mneObj = mvc.Mnemonic.fromString(mnemonicStr)
    // const hdpk = mneObj.toHDPrivateKey('', network)
    const mainnetHdpk = mneObj.toHDPrivateKey('', 'mainnet')
    const mainnetPrivateKey = mainnetHdpk.deriveChild(`m/44'/${selectedPath.value}'/0'/0/0`).privateKey
    const mainnetAddress = mainnetPrivateKey.toAddress('mainnet').toString()

    const testnetHdpk = mneObj.toHDPrivateKey('', 'testnet')
    const testnetPrivateKey = testnetHdpk.deriveChild(`m/44'/${selectedPath.value}'/0'/0/0`).privateKey
    const testnetAddress = testnetPrivateKey.toAddress('testnet').toString()

    // 保存账号信息：助记词、私钥、地址；以地址为key，value为对象
    const account = {
      mnemonic: mnemonicStr,
      path: selectedPath.value,
      mainnetPrivateKey: mainnetPrivateKey.toString(),
      mainnetAddress,
      testnetPrivateKey: testnetPrivateKey.toString(),
      testnetAddress,
      assetsDisplay: ['SPACE'],
    }

    await addAccount(account)

    // 跳转到首页
    router.push('/')
  } catch (e) {
    console.log(e)
    error.value = 'Failed to import your wallet'
  }
}
</script>

<template>
  <div class="mt-4">
    <div class="relative">
      <img class="mx-auto h-20 w-20" :src="MetaletLogoImg" alt="metalet-logo" />
    </div>
    <div class="mt-8 space-y-2">
      <h3 class="text-center text-2xl">Import your wallet</h3>

      <p class="text-center text-sm text-gray-500">
        Enter your multi-word secret phrase to import your existing wallet
      </p>
    </div>

    <!-- words -->
    <div class="mt-12">
      <h3 class="mb-3 flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-1">
          <span>SECRET PHRASE</span>
          <button @click="clearWords" title="clear">
            <TrashIcon class="h-4 w-4 text-gray-400 transition hover:text-blue-500" />
          </button>
        </div>

        <RadioGroup v-model="selectedWordsLength">
          <div class="flex items-center gap-x-2">
            <RadioGroupOption v-slot="{ checked }" :value="length" v-for="length of wordsLengths" class="rounded">
              <div
                :class="[
                  checked ? 'bg-blue-100 text-blue-500' : 'text-gray-500',
                  'rounded-inherit w-full cursor-pointer py-0.5 px-2 text-center text-xs',
                ]"
              >
                {{ `${length} words` }}
              </div>
            </RadioGroupOption>
          </div>
        </RadioGroup>
      </h3>

      <div class="grid grid-cols-3 gap-2">
        <!-- input框 绑定粘贴事件 -->
        <input
          v-for="(word, index) in words"
          :key="index"
          type="text"
          class="pit-input gradient-text font-bold"
          :placeholder="(index + 1).toString()"
          v-model="words[index]"
          @paste.prevent="onPasteWords"
        />
      </div>
    </div>

    <!-- 使用路径 -->
    <div class="mt-4">
      <RadioGroup v-model="selectedPath">
        <RadioGroupLabel class="mb-2 text-xs text-gray-500">PATH</RadioGroupLabel>
        <div class="flex items-center gap-x-2">
          <RadioGroupOption v-slot="{ checked }" :value="path" v-for="path of paths" class="w-24 rounded">
            <div
              :class="[
                checked ? 'bg-blue-100 text-blue-500' : 'text-gray-500',
                'rounded-inherit w-full cursor-pointer py-0.5 text-center',
              ]"
            >
              {{ path }}
            </div>
          </RadioGroupOption>
        </div>
      </RadioGroup>
    </div>

    <!-- ok -->
    <div class="flex items-center justify-center">
      <button
        class="main-btn-bg mt-8 grow rounded-md py-3 text-sm font-bold text-sky-50"
        :class="[!finished && 'muted']"
        :disabled="!finished"
        @click="onSubmit"
      >
        OK
      </button>
    </div>

    <!-- error -->
    <div class="mt-4 text-center text-sm text-red-500" v-if="error">{{ error }}</div>
  </div>
</template>
