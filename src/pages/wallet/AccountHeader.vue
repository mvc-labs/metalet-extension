<script lang="ts" setup>
import { ref, inject } from 'vue'
import { FlexBox } from '@/components'
import { useRouter } from 'vue-router'
import { getNetwork } from '@/lib/network'
import Avatar from '@/components/Avatar.vue'
import CopyIcon from '@/assets/icons-v3/copy.svg'
import { getAddress, type Account } from '@/lib/account'
import { PencilSquareIcon } from '@heroicons/vue/24/solid'
import ServiceMenu from '@/components/headers/ServiceMenu.vue'
import SettingMenu from '@/components/headers/SettingMenu.vue'
import EditName from '@/pages/accounts/components/EditName.vue'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

const network = ref()
const address = ref()
const router = useRouter()

getAddress().then((_address) => (address.value = _address))
getNetwork().then((_network) => (network.value = _network))

const { account } = defineProps<{
  account: Account
}>()

const openEditNameModal = ref(false)

const toAccountList = () => {
  router.push('/accounts')
}

const copy = () => {
  toast({ title: 'success', description: `${address.value} copied` })
  navigator.clipboard.writeText(address.value)
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
      <CopyIcon class="cursor-pointer" @click="copy" />
      <SettingMenu />
      <ServiceMenu class="cursor-pointer" />
    </div>
  </div>
</template>

<style scoped lang="css"></style>
