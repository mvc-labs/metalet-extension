<script lang="ts" setup>
import { ref, Ref } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import { getNetwork, setNetwork } from '../../../lib/network'

type Network = {
  id: number
  type: 'testnet' | 'mainnet'
}
const networks = [
  { id: 1, type: 'mainnet' },
  { id: 2, type: 'testnet' },
] as Network[]
const selectedNetwork: Ref<Network> = ref(networks[0])
const initialed = ref(false)
getNetwork().then((networkType) => {
  selectedNetwork.value = networks.find((network) => network.type === networkType) || networks[0]
  initialed.value = true
})
const select = async (network: Network) => {
  selectedNetwork.value = network

  // 存入存储
  await setNetwork(network.type)

  //

  // force a reload
  window.location.reload()
}
</script>

<template>
  <Listbox
    :modelValue="selectedNetwork"
    @update:modelValue="(network: Network) => select(network)"
    as="component"
    v-slot="{ open }"
  >
    <div class="relative transition-all duration-200">
      <ListboxButton class="relative flex items-center gap-x-0.5 py-1 hover:text-blue-700">
        <span class="capitalize" v-if="initialed">{{ selectedNetwork.type }}</span>
        <ChevronRightIcon :class="['h-4 w-4 transition-all', open && 'rotate-90']" />
      </ListboxButton>

      <ListboxOptions class="absolute right-0 mt-1 divide-y divide-gray-100 rounded-md bg-white shadow-md">
        <ListboxOption
          v-for="network in networks"
          :key="network.id"
          :value="network"
          class="cursor-pointer px-8 py-4 capitalize hover:bg-gray-50 hover:text-blue-500"
        >
          {{ network.type }}
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>
