<script lang="ts" setup>
import { ref } from 'vue'
import MigrateModal from '@/components/MigrateModal.vue'
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import {
  getV0Account,
  getLegacyAccountsObj,
  getV2AccountsObj,
  hasV0Account,
  hasLegacyAccounts,
  hasV2Accounts,
} from '@/lib/account'

const hasV0 = ref(false)
const hasV1 = ref(false)
const hasV2 = ref(false)
const showResetModal = ref(false)

hasV0Account().then((_hasV0) => (hasV0.value = _hasV0))
hasLegacyAccounts().then((_hasV1) => (hasV1.value = _hasV1))
hasV2Accounts().then((_hasV2) => (hasV2.value = _hasV2))

const getFilename = (version: string) => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${version}Accounts_${
    year +
    month.toString().padStart(2, '0') +
    day.toString().padStart(2, '0') +
    hour.toString().padStart(2, '0') +
    minute.toString().padStart(2, '0') +
    second.toString().padStart(2, '0')
  }.json`
}

const exportV0Accout = async () => {
  const v0Account = await getV0Account()
  exportAccouts(JSON.stringify(v0Account), 'V0')
}

const removeV0Accout = async () => {
  await exportV0Accout()
}

const exportV1Accouts = async () => {
  const v1Accounts = await getLegacyAccountsObj()
  exportAccouts(JSON.stringify(v1Accounts), 'V1')
}

const exportV2Accouts = async () => {
  const v2Accounts = await getV2AccountsObj()
  exportAccouts(JSON.stringify(v2Accounts), 'V2')
}

const exportAccouts = async (jsonStr: string, version: string) => {
  const link = document.createElement('a')
  link.download = getFilename(version)
  link.href = 'data:text/plain,' + jsonStr
  link.click()
}
</script>

<template>
  <div class="space-y-2 mt-4">
    <div class="text-base font-bold">Migrate</div>

    <div class="divide-y divide-gray-100">
      <div class="setting-item group cursor-pointer" @click="showResetModal = true">
        <div class="text-gray-500 group-hover:underline">Migrate V3 Accounts version</div>
        <div class="">
          <ChevronRightIcon class="link-icon" />
        </div>
      </div>
    </div>
  </div>
  <div class="space-y-2 mt-4" v-if="false">
    <div class="text-base font-bold">Export</div>

    <div class="divide-y divide-gray-100">
      <div class="setting-item group cursor-pointer" @click="exportV0Accout" v-if="hasV0">
        <div class="text-gray-500 group-hover:underline">Export V0 account cache</div>
        <div class="">
          <ChevronRightIcon class="link-icon" />
        </div>
      </div>

      <div class="setting-item group cursor-pointer" @click="exportV1Accouts" v-if="hasV1">
        <div class="text-gray-500 group-hover:underline">Export V1 accounts cache</div>
        <div class="">
          <ChevronRightIcon class="link-icon" />
        </div>
      </div>

      <div class="setting-item group cursor-pointer" @click="exportV2Accouts" v-if="hasV2">
        <div class="text-gray-500 group-hover:underline">Export V2 accounts cache</div>
        <div class="">
          <ChevronRightIcon class="link-icon" />
        </div>
      </div>
    </div>
  </div>
  <div class="space-y-2 mt-4">
    <div class="text-base text-red-500 font-bold">Remove</div>

    <div class="divide-y divide-gray-100">
      <div class="setting-item group cursor-pointer" @click="removeV0Accout" v-if="hasV0">
        <div class="text-red-300 group-hover:underline group-hover:text-red-500">
          Remove V0 account cache (Force export)
        </div>
        <div class="">
          <ChevronRightIcon class="link-icon-danger" />
        </div>
      </div>

      <div class="setting-item group cursor-pointer" @click="" v-if="hasV1">
        <div class="text-red-300 group-hover:underline group-hover:text-red-500">
          Remove V1 account cache (Force export)
        </div>
        <div class="">
          <ChevronRightIcon class="link-icon-danger" />
        </div>
      </div>

      <div class="setting-item group cursor-pointer" @click="" v-if="hasV2">
        <div class="text-red-300 group-hover:underline group-hover:text-red-500">
          Remove V2 account cache (Force export)
        </div>
        <div class="">
          <ChevronRightIcon class="link-icon-danger" />
        </div>
      </div>
    </div>
  </div>

  <MigrateModal v-model:show="showResetModal" />
</template>

<style lang="css" scoped>
.setting-item {
  @apply -mx-2 flex items-center justify-between px-2 py-4 transition-all duration-200 ease-in-out hover:bg-gray-300/20;
}

.link-icon {
  @apply h-4 w-4 text-gray-500 group-hover:text-blue-500;
}

.link-icon-danger {
  @apply h-4 w-4 text-red-300 group-hover:text-red-500;
}
</style>
