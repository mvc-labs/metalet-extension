<script lang="ts" setup>
import { ref } from 'vue'
import password from '@/lib/password'
import { useRouter } from 'vue-router'
import ResetModal from '../ResetModal.vue'
import SettingIcon from '@/assets/icons/setting-v3.svg'
import { type Account, getCurrentAccount } from '@/lib/account'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const router = useRouter()

const account = ref<Account | undefined>()
getCurrentAccount().then((acc) => {
  account.value = acc
})

const hasPassword = ref(false)
password.has().then((has) => {
  hasPassword.value = has
})
const lock = async () => {
  await password.lock()
  router.push('/lock')
}

const setPassword = () => {
  router.push('/wallet/set-password')
}

const showResetModal = ref(false)

const toAccountList = () => {
  router.push('/accounts')
}

const toSetting = () => {
  router.push('/settings')
}
</script>

<template>
  <Menu as="div" class="relative z-[1] transition-all duration-200" v-if="account">
    <MenuButton class="relative flex items-center gap-x-0.5 py-1 hover:text-blue-700">
      <SettingIcon class="cursor-pointer" />
    </MenuButton>

    <MenuItems class="absolute right-0 rounded-md border border-gray-100 bg-white text-xs shadow-md">
      <MenuItem>
        <button class="menu-item" @click="toSetting">Setting</button>
      </MenuItem>

      <MenuItem>
        <button class="menu-item" @click="lock" v-if="hasPassword">Lock</button>
        <button class="menu-item" @click="setPassword" v-else>Set Password</button>
      </MenuItem>

      <MenuItem>
        <button class="menu-item" @click="toAccountList">Add / Switch Account</button>
      </MenuItem>

      <!-- disconnect button -->
      <MenuItem v-if="hasPassword">
        <button class="menu-item" @click="showResetModal = true">Reset Account</button>
      </MenuItem>
    </MenuItems>
  </Menu>

  <ResetModal v-model:show="showResetModal" />
</template>

<style scoped lang="css">
.menu-item {
  @apply w-full whitespace-nowrap rounded-inherit p-4 text-left capitalize hover:bg-gray-50 hover:text-blue-500;
}

.reset-button {
  @apply rounded-lg border-2 py-3 text-sm font-bold;
}
</style>
