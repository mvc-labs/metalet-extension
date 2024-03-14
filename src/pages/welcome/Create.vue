<script lang="ts" setup>
import { ref } from 'vue'
import { mvc } from 'meta-contract'
import { addAccount } from '@/lib/account'
import passwordManager from '@/lib/password'
import { FlexBox, Button } from '@/components'
import MoreIcon from '@/assets/icons-v3/more-crytos.svg'
import BtcLogoIcon from '@/assets/images/btc-logo.svg?url'
import SpaceLogoIcon from '@/assets/icons-v3/space.svg?url'
import SuccessPNG from '@/assets/icons-v3/send-success.png'
import CreatePassword from './components/CreatePassword.vue'
import { deriveAllAddresses, type AddressType } from '@/lib/bip32-deriver'

const step = ref(1)
const stepLen = ref(2)
const successed = ref(false)
const hasPassword = ref(false)

passwordManager.has().then((_hasPassword) => {
  if (_hasPassword) {
    hasPassword.value = true
    stepLen.value = 1
  }
})

// 保存账号
const createAccount = async () => {
  const mnemonic = mvc.Mnemonic.fromRandom()
  const words = mnemonic.toString().split(' ')
  const mnemonicStr = words.join(' ')
  try {
    const fullPath = `m/44'/10001'/0'/0/0`
    const btcPath = fullPath

    const allAddresses = deriveAllAddresses({
      mnemonic: mnemonicStr,
      btcPath,
      mvcPath: fullPath,
    })

    // construct new account object
    const account = {
      mnemonic: mnemonicStr,
      assetsDisplay: ['SPACE', 'BTC'],
      mvc: {
        path: fullPath,
        addressType: 'P2PKH' as AddressType,
        mainnetAddress: allAddresses.mvcMainnetAddress,
        testnetAddress: allAddresses.mvcTestnetAddress,
      },
      btc: {
        path: btcPath,
        addressType: 'P2PKH' as AddressType,
        mainnetAddress: allAddresses.btcMainnetAddress,
        testnetAddress: allAddresses.btcTestnetAddress,
      },
    }
    await addAccount(account)

    successed.value = true
  } catch (e) {
    console.log(e)
  }
}

createAccount()
</script>

<template>
  <FlexBox d="col" class="w-full gap-20">
    <FlexBox ai="center" jc="center" class="w-full h-[70px]" :gap="2">
      <FlexBox
        ai="center"
        jc="center"
        :class="['step-circle', step === _step ? 'active' : undefined]"
        v-for="_step in Array.from({ length: stepLen }, (_, i) => i + 1)"
        >{{ _step }}</FlexBox
      >
    </FlexBox>
    <FlexBox jc="center" class="w-full">
      <FlexBox d="col" class="w-82" v-if="!hasPassword">
        <CreatePassword
          :callback="
            () => {
              step = step + 1
              hasPassword = true
              successed = true
            }
          "
        />
      </FlexBox>
      <FlexBox d="col" class="w-82" v-else-if="successed">
        <FlexBox d="col" ai="center">
          <img :src="SuccessPNG" alt="Send Success" class="w-30" />
          <h1 class="text-2xl mt-6 font-medium">Wallet created successfully</h1>
          <p class="text-sm mt-12 text-gray-primary">Metalet currently supports the following cryptos</p>
          <FlexBox ai="center" :gap="4" class="mt-4">
            <img :src="BtcLogoIcon" class="w-11" alt="Bitcoin" />
            <img :src="SpaceLogoIcon" class="w-11" alt="Space" />
            <MoreIcon />
          </FlexBox>
          <Button type="primary" class="mt-26 w-61.5" @click="() => $router.push('/wallet')">Activate Metalet</Button>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  </FlexBox>
</template>

<style scoped>
.step-circle {
  @apply w-6 h-6 bg-gray-secondary text-gray-primary rounded-full text-ss cursor-pointer;
}

.step-circle.active {
  @apply bg-blue-primary text-white;
}

button[aria-selected='true'] {
  @apply bg-white text-blue-primary rounded-md;
}

div[role='tabpanel'][data-state='active'] {
  @apply mt-4;
}

button[role='combobox'] {
  @apply border-none focus:ring-0 p-0;
}
</style>
