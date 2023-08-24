<script lang="ts" setup>
import { ref } from 'vue'
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import { useRouter } from 'vue-router'

import passwordManager from '@/lib/password'
import { VERSION } from '@/data/config'

import SelectNetwork from './components/SelectNetwork.vue'
import ResetModal from '@/components/ResetModal.vue'

function openWindowMode() {
  window.open(window.location.href, '_blank')
}

const router = useRouter()

const hasPassword = ref(false)
passwordManager.has().then((has) => {
  hasPassword.value = has
})

const toDiscord = () => {
  window.open('https://discord.gg/4FDEq8cJHj', '_blank')
}

const toGithub = () => {
  window.open('https://github.com/mvc-labs/metalet-extension', '_blank')
}

const toTerms = () => {
  window.open('https://docs.google.com/document/d/1JFUS6f3Vs3Jh2CA4xpTixOUaMto4pANxmM_7b3suut8/edit', '_blank')
}

const toPolicy = () => {
  window.open('https://docs.google.com/document/d/1MyCcA9E6sVd6ThvQaocBeN07umYUJB4zhbhT3E4LxWw/edit', '_blank')
}

const toCurrentAccount = () => {
  router.push('/settings/current-account')
}

const setPassword = () => {
  router.push('/wallet/set-password')
}

const toBackup = () => {
  router.push('/wallet/backup')
}

const showResetModal = ref(false)
</script>

<template>
  <div class="space-y-8 pt-4 text-sm">
    <!-- general -->
    <div class="space-y-2">
      <div class="text-base font-bold">General</div>
      <div class="divide-y divide-gray-100">
        <div class="setting-item">
          <div class="text-gray-500">Network</div>
          <SelectNetwork />
        </div>

        <div class="setting-item group cursor-pointer" @click="toCurrentAccount">
          <div class="text-gray-500 group-hover:underline">Current Account</div>
          <div class="">
            <ChevronRightIcon class="link-icon" />
          </div>
        </div>

        <div class="setting-item group cursor-pointer" @click="openWindowMode">
          <div class="text-gray-500 group-hover:underline">Open in Window Mode</div>
          <div class="">
            <ChevronRightIcon class="link-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- security -->
    <div class="space-y-2">
      <div class="text-base font-bold">Security</div>

      <div class="divide-y divide-gray-100">
        <!-- <div class="setting-item group cursor-pointer" @click="toCurrentAccount">
          <div class="text-gray-500 group-hover:underline">Change Password</div>
          <div class="">
            <ChevronRightIcon class="link-icon" />
          </div>
        </div> -->

        <div class="setting-item group cursor-pointer" @click="toBackup" v-if="hasPassword">
          <div class="text-gray-500 group-hover:underline">Backup</div>
          <div class="">
            <ChevronRightIcon class="link-icon" />
          </div>
        </div>

        <div class="setting-item group cursor-pointer" @click="setPassword" v-else>
          <div class="text-gray-500 group-hover:underline">Set Password</div>
          <div class="">
            <ChevronRightIcon class="link-icon" />
          </div>
        </div>

        <div class="setting-item group cursor-pointer" @click="showResetModal = true" v-if="hasPassword">
          <div class="text-gray-500 group-hover:underline">Reset Account</div>
          <div class="">
            <ChevronRightIcon class="link-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- about -->
    <div class="space-y-2">
      <div class="text-base font-bold">About</div>
      <div class="divide-y divide-gray-100">
        <div class="setting-item group cursor-pointer" @click="toTerms">
          <div class="text-gray-500 group-hover:underline">Terms of Service</div>
          <div class="">
            <ArrowTopRightOnSquareIcon class="link-icon" />
          </div>
        </div>
        <div class="setting-item group cursor-pointer" @click="toPolicy">
          <div class="text-gray-500 group-hover:underline">Privacy Policy</div>
          <div class="">
            <ArrowTopRightOnSquareIcon class="link-icon" />
          </div>
        </div>
        <div class="setting-item group cursor-pointer" @click="toDiscord">
          <div class="text-gray-500 group-hover:underline">Get Help at Discord</div>
          <div class="">
            <ArrowTopRightOnSquareIcon class="link-icon" />
          </div>
        </div>
        <div class="setting-item group cursor-pointer" @click="toGithub">
          <div class="text-gray-500 group-hover:underline">Source Code at Github</div>
          <div class="">
            <ArrowTopRightOnSquareIcon class="link-icon" />
          </div>
        </div>

        <div class="setting-item">
          <div class="text-gray-500">Version</div>
          <div class="">{{ VERSION }} (Alpha)</div>
        </div>
      </div>
    </div>
  </div>

  <ResetModal v-model:show="showResetModal" />
</template>

<style lang="css" scoped>
.setting-item {
  @apply -mx-2 flex items-center justify-between px-2 py-4 transition-all duration-200 ease-in-out hover:bg-gray-300/20;
}

.link-icon {
  @apply h-4 w-4 text-gray-500 group-hover:text-blue-500;
}
</style>
