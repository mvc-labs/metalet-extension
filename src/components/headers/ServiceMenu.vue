<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BtcLogoImg from '@/assets/images/btc-logo.svg?url'
import SpaceLogoImg from '@/assets/images/space-logo.svg?url'
import DownArrowImg from '@/assets/icons-v3/down-arrow.svg?url'
import { type Service, getServiceNetwork } from '@/lib/network'
import NetworkTypeImg from '@/assets/icons/network-type.svg?url'
import AllNetworkTypeImg from '@/assets/icons/all-network-type.svg?url'

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
  <div class="w-[50px] h-[34px] rounded-[18px] py-1 px-2 flex items-center justify-center gap-1 bg-[#F5F5F5] cursor-pointer" @click="goToNetwork">
    <img v-if="service === 'all'" :src="AllNetworkTypeImg" alt="" class="w-[22px] h-[22px]" />
    <img v-else-if="service === 'btc'" :src="BtcLogoImg" alt="Bitcoin" class="w-[22px] h-[22px]" />
    <img v-else-if="service === 'mvc'" :src="SpaceLogoImg" alt="Microvisionchain" class="w-[22px] h-[22px]" />
    <img v-else :src="NetworkTypeImg" alt="" class="w-[22px] h-[22px]" />
    <img :src="DownArrowImg" alt="" />
  </div>
</template>

<style scoped lang="css"></style>
