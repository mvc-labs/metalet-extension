<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ChevronRightIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import { mvc } from 'meta-contract'
import { computed, nextTick, ref, watch } from 'vue'

import { getCurrentAccount } from '@/lib/account'
import { inferDerivationPath } from '@/lib/bip32-deriver'
import { raise, sleep } from '@/lib/helpers'

const address = ref<string>('')
const foundPath = ref<string>('')
const searchingPath = ref<string>('')
const isFinding = ref<boolean>(false)
const failed = ref<boolean>(false)

// watch address change; reset all states
watch(address, () => {
  foundPath.value = ''
  failed.value = false
})

const isValidAddress = computed(() => {
  const hasSomething = !!address.value

  return hasSomething && (mvc.Address as any).isValid(address.value)
})

async function find() {
  foundPath.value = ''
  failed.value = false
  isFinding.value = true

  const account = (await getCurrentAccount()) ?? raise('No account found')
  const mnemonic = account.mnemonic

  await sleep(100)
  for (let res of inferDerivationPath(mnemonic, address.value)) {
    if (!isFinding.value) break

    searchingPath.value = res.path

    if (res.status === 'success') {
      foundPath.value = res.path
      break
    }
    await sleep(10)
  }
  isFinding.value = false

  if (!foundPath.value) {
    failed.value = true
  }
}
</script>

<template>
  <div>
    <h3 class="gradient-text  text-lg">MVC Path Finder</h3>
    <p class="text-sm text-gray-600">
      This tool is designed to help you find the correct derivation path for your wallet.
    </p>
    <p class="text-sm text-gray-600">
      It might take a long time to find the correct path. Please be patient and wait for the result.
    </p>

    <Disclosure v-slot="{ open }">
      <DisclosureButton class="mt-4 text-gray-400 flex items-center gap-1">
        <span>When should I use Path Finder?</span>
        <ChevronRightIcon class="inline-block w-4 h-4 transition duration-200" :class="open && 'rotate-90 transform'" />
      </DisclosureButton>
      <DisclosurePanel class="text-sm text-gray-600">
        In case you recovered your original wallet using the mnemonic phrase, but failed to match your original address.
      </DisclosurePanel>
    </Disclosure>

    <Disclosure v-slot="{ open }">
      <DisclosureButton class="mt-2 text-gray-400 flex items-center gap-1">
        <span>How to use Path Finder?</span>

        <ChevronRightIcon class="inline-block w-4 h-4 transition duration-200" :class="open && 'rotate-90 transform'" />
      </DisclosureButton>
      <DisclosurePanel class="text-sm text-gray-600">
        <p>
          Enter your original address (the one you want to find out). This tool will loop through all the possible
          derivation path and try to match your original address. Once it finds a match, it will display the derivation.
          You can then use this derivation path to recover your wallet.
        </p>
        <p class="mt-1">
          <span class="">Note:</span> This tool will not require you to enter your mnemonic phrase. It only
          tries to find out your old address using existing accounts in your wallet. All calculations are done locally
          in the extension.
        </p>
      </DisclosurePanel>
    </Disclosure>

    <div class="mt-8">
      <div class="">
        <label class="label ">Target Address</label>
        <input
          type="text"
          class="pit-input block w-full mt-1"
          placeholder="Enter your target address"
          v-model="address"
        />
      </div>

      <div class="mt-4">
        <label class="label ">Found Derivation Path</label>
        <div class="h-10">
          <span v-if="foundPath" class="text-green-500 ">{{ foundPath }}</span>
          <div class="flex items-center gap-2" v-else-if="isFinding">
            <SparklesIcon class="block w-8 h-8 m-1 text-gray-500 animate-pulse" />
            <div class="">
              <div class="text-gray-500">Searching path (0 - 20000)</div>
              <div class="">{{ searchingPath }}</div>
            </div>
          </div>
          <span v-else>-</span>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-2">
        <button
          class="border border-gray-300 rounded-md px-8 py-1 enabled:shadow-md  enabled:hover-gradient-text disabled:opacity-30"
          :disabled="!isValidAddress || isFinding"
          @click="find"
        >
          {{ isFinding ? 'Finding...' : 'Find' }}
        </button>

        <button
          class="border border-gray-300 rounded-md px-8 py-1 shadow-md  hover-gradient-text"
          v-if="isFinding"
          @click="isFinding = false"
        >
          Stop
        </button>
      </div>

      <p class="mt-4 text-sm text-red-500" v-if="failed">
        Failed to find the derivation path of the target address. Please make sure you entered the correct address, or
        to confirm this address is derived from current mnemonic phrase.
      </p>
    </div>
  </div>
</template>

<style scoped></style>
