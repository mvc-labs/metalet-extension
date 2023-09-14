<script lang="ts" setup>
import { ref, computed, Ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  RadioGroup,
  RadioGroupOption,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { TrashIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/24/solid'

import MetaletLogoImg from '@/assets/images/metalet-logo.png?url'
import { addAccount } from '@/lib/account'
import { deriveAllAddresses, scripts, type AddressType } from '@/lib/bip32-deriver'

const selectedScript = ref(scripts[3])

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

const pathDepth = ref('10001')

const finished = computed(() => words.value.every((word) => word.length > 0))

const error = ref('')
const onSubmit = async () => {
  if (!finished.value) return false

  // 拼接助记词
  const mnemonicStr = words.value.join(' ')

  // 转化成私钥
  try {
    const fullPath = `m/44'/${pathDepth.value}'/0'/0/0`
    const btcPath = `m/86'/0'/0'/0/0`

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
        addressType: selectedScript.value.addressType,
        mainnetAddress: allAddresses.btcMainnetAddress,
        testnetAddress: allAddresses.btcTestnetAddress,
      },
    }

    await addAccount(account)

    // 跳转到首页
    router.push('/wallet')
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
                  'w-full cursor-pointer rounded-inherit px-2 py-0.5 text-center text-xs',
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
    <div class="mt-6">
      <Disclosure v-slot="{ open }">
        <DisclosureButton class="flex items-center gap-1">
          <span class="text-xs text-gray-500">MVC Path</span>
          <!-- <ChevronRightIcon :class="['h-4 w-4 text-gray-400 transition duration-200', open && 'rotate-90 transform']" /> -->
        </DisclosureButton>

        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-out"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <DisclosurePanel class="mt-1 space-y-2 rounded-lg bg-gray-100 p-4 text-sm text-gray-500 shadow-inner">
            <h3 class="text-sm font-bold text-gray-900">What is a derivation path?</h3>
            <p class="">
              A derivation path is used to generate your wallet address. You can use the default path or customize it.
            </p>
            <p>The default path used by Metalet is <span class="font-bold">m/44'/10001'/0'</span></p>
          </DisclosurePanel>
        </transition>
      </Disclosure>

      <div class="mt-2 text-sm tracking-wide text-black">
        <span class="">m/44'/</span>
        <input type="text" placeholder="10001" class="pit-input mx-2 w-16" v-model="pathDepth" />
        <span class="">'/0'</span>
      </div>
    </div>

    <span class="text-xs text-gray-500">BTC Path</span>

    <Listbox v-model="selectedScript">
      <div class="relative mt-1">
        <ListboxButton
          class="relative w-full cursor-default rounded-lg bg-[#f5f5f5] py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
        >
          <span class="block truncate">{{ selectedScript.path }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#f5f5f5] py-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            <ListboxOption
              v-slot="{ selected }"
              v-for="script in scripts"
              :key="script.name"
              :value="script"
              as="template"
            >
              <li :class="['text-gray-900', 'relative cursor-pointer select-none py-1 pl-3 pr-4']">
                <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ script.path }}</span>
                <span
                  v-if="selected"
                  class="absolute inset-y-2 right-2 flex h-5 w-5 items-center justify-center rounded-md bg-[#1E2BFF] text-white"
                >
                  <CheckIcon class="h-4 w-4" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>

    <!-- ok -->
    <div class="mt-32 flex items-center justify-center">
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
@/lib/bip32-deriver
