<script lang="ts" setup>
import { account, getAddress, address } from '../../lib/account'
getAddress()
</script>

<template>
  <div class="flex flex-col gap-y-8 py-8">
    <div class="">
      <div class="label">Address</div>
      <div class="value">{{ address }}</div>
    </div>
    <!-- 
    <div class="">
      <div class="label">Mnemonic (Seedphrase)</div>
      <div class="value">{{ account?.mnemonic }}</div>
    </div> -->

    <div class="">
      <div class="label">Path</div>
      <div class="value">{{ account?.path }}</div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.label {
  @apply text-sm font-bold text-gray-500;
}

.value {
  @apply text-base text-gray-700;
}
</style>
