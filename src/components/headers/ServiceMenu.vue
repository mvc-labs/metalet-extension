<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BtcLogoImg from '@/assets/images/btc-logo.svg?url'
import DownArrowImg from '@/assets/icons/down-arrow.svg?url'
import SpaceLogoImg from '@/assets/images/space-logo.svg?url'
import NetworkTypeImg from '@/assets/icons/network-type.svg?url'
import AllNetworkTypeImg from '@/assets/icons/all-network-type.svg?url'
import { type Service, getServiceNetwork } from '@/lib/network'

const router = useRouter()
const service = ref<Service | undefined>()

getServiceNetwork().then((_service) => {
  service.value = _service
})

const goToNetwork = () => {
  router.push('/wallet/select-network')
}
</script>

<template>
  <div class="w-12 rounded-[20px] py-1 px-2 flex gap-1.5 bg-[#F5F5F5] cursor-pointer" @click="goToNetwork">
    <img v-if="service === 'all'" :src="AllNetworkTypeImg" alt="" class="w-4 h-4" />
    <img v-else-if="service === 'btc'" :src="BtcLogoImg" alt="Bitcoin" class="w-4 h-4" />
    <img v-else-if="service === 'mvc'" :src="SpaceLogoImg" alt="Microvisionchain" class="w-4 h-4" />
    <img v-else :src="NetworkTypeImg" alt="" class="w-4 h-4" />
    <img :src="DownArrowImg" alt="" />
  </div>
</template>

<style scoped lang="css"></style>
