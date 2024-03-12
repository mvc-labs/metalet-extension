<script lang="ts" setup>
import { ref, inject } from 'vue'
import { FlexBox } from '@/components'
import { useRouter } from 'vue-router'
import { getNetwork } from '@/lib/network'
import Avatar from '@/components/Avatar.vue'
import CopyIcon from '@/assets/icons-v3/copy.svg'
import { getAddress, type Account } from '@/lib/account'
import { PencilSquareIcon } from '@heroicons/vue/24/solid'
import { useToast } from '@/components/ui/toast/use-toast'
import ServiceMenu from '@/components/headers/ServiceMenu.vue'
import SettingMenu from '@/components/headers/SettingMenu.vue'
import EditName from '@/pages/accounts/components/EditName.vue'
import CloseIcon from '@/assets/icons-v3/close.svg'
import BtcLogo from '@/assets/images/btc-logo.svg?url'
import SpaceLogo from '@/assets/images/space-logo.svg?url'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const { toast } = useToast()

const network = ref()
const btcAddress = ref()
const mvcAddress = ref()
const isOpen = ref(false)
const router = useRouter()

getAddress('btc').then((_address) => (btcAddress.value = _address))
getAddress('mvc').then((_address) => (mvcAddress.value = _address))
getNetwork().then((_network) => (network.value = _network))

const { account } = defineProps<{
  account: Account
}>()

const openEditNameModal = ref(false)

const toAccountList = () => {
  router.push('/accounts')
}

const copy = (address: string, type: string) => {
  toast({ title: `${type} Address Copied`, toastType: 'success', description: address })
  navigator.clipboard.writeText(address)
  isOpen.value = false
}
</script>

<template>
  <div class="flex items-center justify-between py-3">
    <FlexBox ai="center" jc="center" :gap="2" class="cursor-pointer" @click="toAccountList">
      <Avatar :id="account.id" />
      <div class="flex items-center gap-x-2">
        <span class="text-black-primary text-sm">{{ account.name }}</span>
        <PencilSquareIcon
          @click.stop
          @click="openEditNameModal = true"
          class="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-500 group-hover:inline"
        />
      </div>
      <EditName v-model:open="openEditNameModal" :account="account" />
    </FlexBox>
    <div class="flex items-center gap-x-4">
      <CopyIcon class="cursor-pointer" @click="isOpen = true" />
      <SettingMenu />
      <ServiceMenu class="cursor-pointer" />
    </div>
  </div>
  <Drawer v-model:open="isOpen">
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle class="text-center relative">
          <span>Wallet Address</span>
          <DrawerClose>
            <CloseIcon class="absolute right-0 top-0" />
          </DrawerClose>
        </DrawerTitle>
      </DrawerHeader>
      <FlexBox d="col" ai="center" :gap="2" class="py-4">
        <FlexBox ai="center" :gap="2">
          <img :src="BtcLogo" alt="Bitcoin" class="w-8" />
          <div>
            <div>Bitcoin</div>
            <div class="text-xs text-gray-primary break-all w-64">{{ btcAddress }}</div>
          </div>
          <CopyIcon class="cursor-pointer" @click="copy(btcAddress, 'Bitcoin')" />
        </FlexBox>
        <FlexBox ai="center" :gap="2">
          <img :src="SpaceLogo" alt="Bitcoin" class="w-8" />
          <div>
            <div>Microvisionchain</div>
            <div class="text-xs text-gray-primary break-all w-64">{{ btcAddress }}</div>
          </div>
          <CopyIcon class="cursor-pointer" @click="copy(mvcAddress, 'Microvisionchain')" />
        </FlexBox>
      </FlexBox>
    </DrawerContent>
  </Drawer>
</template>

<style scoped lang="css"></style>
