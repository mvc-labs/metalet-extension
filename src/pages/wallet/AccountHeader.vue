<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '@/components/Avatar.vue'
import { type Account } from '@/lib/account'
import CopyIcon from '@/assets/icons-v3/copy.svg'
import { PencilSquareIcon } from '@heroicons/vue/24/solid'
import ServiceMenu from '@/components/headers/ServiceMenu.vue'
import SettingMenu from '@/components/headers/SettingMenu.vue'
import EditName from '@/pages/accounts/components/EditName.vue'
import { getNetwork } from '@/lib/network'
import { FlexBox } from '@/components'

const network = ref()
const router = useRouter()

getNetwork().then((_network) => (network.value = _network))


const { account } = defineProps<{
  account: Account
}>()

const openEditNameModal = ref(false)

const toAccountList = () => {
  router.push('/accounts')
}
</script>

<template>
  <div class="flex items-center justify-between py-3">
    <div class="flex items-center space-x-2 cursor-pointer" @click="toAccountList">
      <Avatar :id="account.id" />
      <div class="flex items-center gap-x-2">
        <span class="text-black-primary text-sm">{{ account.name }}</span>
        <PencilSquareIcon @click.stop @click="openEditNameModal = true"
          class="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-500 group-hover:inline" />
      </div>
      <EditName v-model:open="openEditNameModal" :account="account" />
    </div>
    <div class="flex items-center gap-x-4">
      <CopyIcon class="cursor-pointer" />
      <SettingMenu />
      <ServiceMenu class="cursor-pointer" />
    </div>
  </div>
</template>

<style scoped lang="css"></style>
