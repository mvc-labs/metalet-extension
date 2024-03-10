<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BtcLogoImg from '@/assets/images/btc-logo.svg?url'
import CheckIcon from '@/assets/icons/check.svg?component'
import SpaceLogoImg from '@/assets/images/space-logo.svg?url'
import NetworkTypeImg from '@/assets/icons/all-network-type.svg?url'
import { type Service, getServiceNetwork, setServiceNetwork } from '@/lib/network'
import { TabGroup, TabList, Tab, TabPanels, TabPanel, RadioGroup, RadioGroupOption } from '@headlessui/vue'

const router = useRouter()

const service = ref<Service | undefined>()
getServiceNetwork().then((_service) => {
  service.value = _service
})

const updateServiceNetwork = async (_service: Service) => {
  await setServiceNetwork(_service)
  router.replace("/wallet")
}
</script>

<template>
  <RadioGroup v-model="service" class="w-full space-y-[28.5px] mt-[30px]" @update:modelValue="updateServiceNetwork">
    <RadioGroupOption v-slot="{ checked }" value="all" class="flex items-center justify-between cursor-pointer">
      <div class="flex items-center gap-x-1.5">
        <img :src="NetworkTypeImg" alt="All Networks" class="inline-block w-8 h-8" />
        <span class="text-[#141416]">All Networks</span>
      </div>
      <CheckIcon v-if="checked" class="rounded-full w-5 h-5" />
      <div v-else class="rounded-full bg-[#D8D8D8] w-5 h-5"></div>
    </RadioGroupOption>
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
  </RadioGroup>
  <!-- <TabGroup>
    <TabList>
      <Tab>Mainnet</Tab>
      <Tab>Testnet</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <RadioGroup v-model="service" class="w-full space-y-[28.5px]">
          <RadioGroupOption v-slot="{ checked }" value="all" class="flex items-center justify-between cursor-pointer">
            <div class="flex items-center gap-x-1.5">
              <img :src="NetworkTypeImg" alt="All Networks" class="inline-block w-8 h-8" />
              <span class="text-[#141416]">All Networks</span>
            </div>
            <CheckIcon v-if="checked" class="rounded-full w-5 h-5" />
            <div v-else class="rounded-full bg-[#D8D8D8] w-5 h-5"></div>
          </RadioGroupOption>
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
        </RadioGroup>
      </TabPanel>
      <TabPanel>
        <RadioGroup v-model="service" class="w-full space-y-[28.5px]">
          <RadioGroupOption v-slot="{ checked }" value="all" class="flex items-center justify-between cursor-pointer">
            <div class="flex items-center gap-x-1.5">
              <img :src="NetworkTypeImg" alt="All Networks" class="inline-block w-8 h-8" />
              <span class="text-[#141416]">All Networks</span>
            </div>
            <CheckIcon v-if="checked" class="rounded-full w-5 h-5" />
            <div v-else class="rounded-full bg-[#D8D8D8] w-5 h-5"></div>
          </RadioGroupOption>
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
        </RadioGroup>
      </TabPanel>
    </TabPanels>
  </TabGroup> -->
</template>

<style scoped lang="css">
div[role='tablist'] {
  @apply space-x-[18px] mt-[30px] mb-[27px];
}

button[role='tab'] {
  @apply border-0 py-3;
}

button[aria-selected='false'] {
  @apply text-[#BFC2CC];
}

button[aria-selected='true'] {
  outline: none;
  @apply text-[#1E2BFF] border-b-2 border-[#1E2BFF];
}
</style>
