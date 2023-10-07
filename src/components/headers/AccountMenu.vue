<script lang="ts" setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { type Account, getCurrentAccount } from '@/lib/account'
import password from '@/lib/password'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MoreIcon from '@/assets/icons/more.svg?component'
import ResetModal from '../ResetModal.vue'

const router = useRouter()

const account = ref<Account | null>(null)
getCurrentAccount().then((acc) => {
  account.value = acc
})

// const isCopied = ref(false)
// const copyAddress = () => {
//   const address = ""
//   navigator.clipboard.writeText(address)
//   isCopied.value = true
// }

const hasPassword = ref(false)
password.has().then((has) => {
  hasPassword.value = has
})
const lock = async () => {
  await password.lock()

  // 返回锁定页
  router.push('/lock')
}

const setPassword = () => {
  router.push('/wallet/set-password')
}

const showResetModal = ref(false)

const toAccountList = () => {
  router.push('/accounts')
}
</script>

<template>
  <Menu as="div" class="relative z-[1] transition-all duration-200" v-if="account">
    <MenuButton class="relative flex items-center gap-x-0.5 py-1 hover:text-blue-700">
      <MoreIcon class="h-6 w-6 text-gray-500" />
    </MenuButton>

    <MenuItems class="absolute right-0 rounded-md border border-gray-100 bg-white text-xs shadow-md">
      <!-- account info -->
      <!-- <MenuItem>
        <div class="border-b border-gray-200 py-4 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-x-1 text-gray-500">
              <span>ADDRESS</span>
              <ClipboardDocumentCheckIcon class="h-4 w-4 text-blue-500" v-if="isCopied" />
              <button class="text-gray-400 hover:text-gray-500" @click.stop="copyAddress" type="button" v-else>
                <ClipboardDocumentListIcon class="h-4 w-4" />
              </button>
            </div>
            <div class="">{{ address }}</div>
          </div>
        </div>
      </MenuItem> -->

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
