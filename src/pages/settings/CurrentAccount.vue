<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { getCurrentAccount, getAddress, type Account } from '@/lib/account'

const address = ref<string>('')
const account = ref<Account | null>(null)

const router = useRouter()

onMounted(async () => {
  address.value = await getAddress()
  account.value = await getCurrentAccount()
})
</script>

<template>
  <div class="flex flex-col gap-y-8 h-full py-4" v-if="account">
    <div class="">
      <div class="label">Address</div>
      <div class="value">{{ address }}</div>
    </div>

    <div class="">
      <div class="label">MVC Path</div>
      <div class="value">{{ account.mvc.path }}</div>
    </div>

    <div class="">
      <div class="label">BTC Path</div>
      <div class="value">{{ account.btc.path }}</div>
    </div>

    <div class="">
      <div class="label">BTC Address Type</div>
      <div class="value">{{ account.btc.addressType || "Legacy(P2PKH)(m/44'/0'/0')" }}</div>
    </div>

    <div class="border border-dashed"></div>

    <div class="">
      <div class="label">Recover Tools</div>
      <p class="text-sm text-gray-400 underline pb-2">
        NOTE: Don't use these tools unless you know what you are doing.
      </p>
      <div class="pt-1">
        <button
          class="rounded border border-gray-100 px-4 py-1 shadow text-sm hover:border-gray-200 hover:shadow-md transition duration-200"
          @click="router.push('/tools/path-finder')"
        >
          Path finder
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.label {
  @apply text-sm font-bold text-gray-500;
}

.value {
  @apply text-sm text-gray-700;
}
</style>
