<script lang="ts" setup>
import { ref } from 'vue'
import { getAccounts } from '@/lib/account'
import { FlexBox, Button } from '@/components'
import { Checkbox } from '@/components/ui/checkbox'
import WelcomeLogo from '@/assets/icons-v3/welcome-logo.svg'

const checked = ref(false)

const accountsCount = ref(0)
getAccounts().then((accounts) => {
  accountsCount.value = accounts.size
})
</script>

<template>
  <FlexBox ai="center" jc="center" :gap="12" class="w-full h-full">
    <FlexBox d="col" class="gap-y-15">
      <FlexBox d="col" :gap="3">
        <div class="text-2xl font-semibold">Metalet —— <br />The portal to exploring the Web3 blockchain world.</div>
        <p class="text-gray-primary">Unravel blockchain's infinite possibilities, unlock the digital future.</p>
      </FlexBox>
      <FlexBox d="col" :gap="4">
        <FlexBox :gap="2">
          <Button
            type="light"
            :disabled="!checked"
            @click="$router.push('/welcome/import')"
            :class="['w-32.5', !checked ? 'opacity-50' : undefined]"
            >Import wallet</Button
          >
          <Button
            type="primary"
            :disabled="!checked"
            @click="$router.push('/welcome/create')"
            :class="['w-32.5', !checked ? 'opacity-50' : undefined]"
            >Create wallet</Button
          >
        </FlexBox>
        <FlexBox :gap="1.5" ai="center">
          <Checkbox id="terms" v-model:checked="checked" />
          <span class="text-slate-light"
            >I agree to Metlet's <a href="javascript:void(0)" class="text-blue-primary">Terms of use</a></span
          >
        </FlexBox>
      </FlexBox>
    </FlexBox>
    <WelcomeLogo />
  </FlexBox>
</template>
