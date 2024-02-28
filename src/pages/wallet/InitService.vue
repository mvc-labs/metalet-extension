<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useStorage from '@/lib/storage'
import BtcLogoImg from '@/assets/images/btc-logo.svg?url'
import CheckIcon from '@/assets/icons/check.svg?component'
import SpaceLogoImg from '@/assets/images/space-logo.svg?url'
import NetworkIcon from '@/assets/icons/network.svg?component'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { type Service, Service_Network_Key } from '@/lib/network'

const service = ref<Service>('all')

const router = useRouter()

const storage = useStorage()

const goOn = async () => {
  await storage.set(Service_Network_Key, service.value)
  router.push('/wallet/create-success')
}
</script>

<template>
  <div class="pt-8 relative h-full">
    <div class="flex items-center justify-center">
      <NetworkIcon class="h-[66px] w-[66px]" />
    </div>

    <h3 class="mt-4 text-center text-xl">Select Network</h3>

    <p class="mt-2 text-center text-sm text-gray-400">Choose the chain you need to use</p>

    <RadioGroup v-model="service" class="w-full mt-[60px] space-y-[28.5px]">
      <RadioGroupOption v-slot="{ checked }" value="btc" class="flex items-center justify-between cursor-pointer">
        <div class="flex items-center gap-x-1.5">
          <img :src="BtcLogoImg" alt="Bitcoin" class="inline-block w-8 h-8" />
          <span class="text-[#141416]">Bitcoin</span>
        </div>
        <CheckIcon v-if="checked" class="rounded-full w-5 h-5" />
        <div v-else class="rounded-full bg-[#D8D8D8] w-5 h-5"></div>
      </RadioGroupOption>
      <RadioGroupOption v-slot="{ checked }" value="mvc" class="flex items-center justify-between cursor-pointer">
        <div class="flex items-center gap-x-1.5">
          <img :src="SpaceLogoImg" alt="Bitcoin" class="inline-block w-8 h-8" />
          <span class="text-[#141416]">Microvisionchain</span>
        </div>
        <CheckIcon v-if="checked" class="rounded-full w-5 h-5" />
        <div v-else class="rounded-full bg-[#D8D8D8] w-5 h-5"></div>
      </RadioGroupOption>
      <RadioGroupOption v-slot="{ checked }" value="all" class="flex items-center justify-between cursor-pointer">
        <div class="flex items-center gap-x-1.5">
          <img :src="BtcLogoImg" alt="Bitcoin" class="inline-block w-8 h-8" />
          <span class="text-[#141416]">Bitcoin</span>
          <span>&</span>
          <img :src="SpaceLogoImg" alt="Bitcoin" class="inline-block w-8 h-8" />
          <span class="text-[#141416]">Microvisionchain</span>
        </div>
        <CheckIcon v-if="checked" class="rounded-full w-5 h-5" />
        <div v-else class="rounded-full bg-[#D8D8D8] w-5 h-5"></div>
      </RadioGroupOption>
    </RadioGroup>

    <div class="flex self-stretch absolute bottom-9 w-full">
      <button class="main-btn-bg grow rounded-md py-4 text-center leading-none text-white" @click="goOn">OK</button>
    </div>
  </div>
</template>
