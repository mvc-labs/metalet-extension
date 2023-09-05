<script lang="ts" setup>
import { account, getAddress, address } from '@/lib/account'
getAddress()
</script>

<template>
  <div class="flex flex-col gap-y-8 py-8" v-if="account">
    <div class="">
      <div class="label">Address</div>
      <div class="value">{{ address }}</div>
    </div>

    <div class="">
      <div class="label">MVC Path</div>
      <div class="value">{{ `m/44'/${account?.path}'/0'/0/0` }}</div>
    </div>

    <div class="" v-if="account.btcPath">
      <div class="label">BTC Path</div>
      <div class="value">{{ account.btcPath }}</div>
    </div>

    <div class="">
      <div class="label">BTC Address Type</div>
      <div class="value">{{ account?.btcType || "Legacy(P2PKH)(m/44'/0'/0')" }}</div>
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
