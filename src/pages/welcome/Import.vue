<script lang="ts" setup>
import { addAccount } from '@/lib/account'
import passwordManager from '@/lib/password'
import { FlexBox, Button } from '@/components'
import { ref, computed, Ref, watch } from 'vue'
import MoreIcon from '@/assets/icons-v3/more-crytos.svg'
import BtcLogoIcon from '@/assets/images/btc-logo.svg?url'
import SpaceLogoIcon from '@/assets/icons-v3/space.svg?url'
import SuccessPNG from '@/assets/icons-v3/send-success.png'
import ArrowLeftIcon from '@/assets/icons-v3/arrow-left.svg'
import CreatePassword from './components/CreatePassword.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { deriveAllAddresses, scripts, type AddressType } from '@/lib/bip32-deriver'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const step = ref(1)
const stepLen = ref(3)
const successed = ref(true)
const hasPassword = ref(false)

const selectableScripts = scripts.slice(0, -1)
const selectedScript = ref(selectableScripts[0])

const selectedWordsLength = ref('12')
const wordsLengths = [12, 15, 18, 21, 24]
watch(
  () => selectedWordsLength.value,
  () => {
    clearWords()
    words.value = Array(Number(selectedWordsLength.value)).fill('')
  }
)
const words: Ref<string[]> = ref(Array(Number(selectedWordsLength.value)).fill(''))

const clearWords = () => {
  words.value = Array(selectedWordsLength.value).fill('')
}

passwordManager.has().then((_hasPassword) => {
  if (_hasPassword) {
    hasPassword.value = true
    stepLen.value = 2
  }
})

const onPasteWords = (e: ClipboardEvent) => {
  error.value = ''
  const text = e.clipboardData?.getData('text')
  if (text) {
    const wordsArr = text.split(' ')
    if (wordsArr.length === Number(selectedWordsLength.value)) {
      words.value = wordsArr
    } else {
      error.value = 'Invalid secret phrase. Please check and try again.'
    }
  }
}

const mvcPath = ref('10001')

const useSamePath = ref(true)

const finished = computed(() => words.value.every((word) => word.length > 0))

const error = ref()
const onSubmit = async () => {
  if (!finished.value) return false

  // 拼接助记词
  const mnemonicStr = words.value.join(' ')

  // 转化成私钥
  try {
    const fullPath = `m/44'/${mvcPath.value}'/0'/0/0`
    const btcPath = useSamePath.value ? fullPath : selectedScript.value.path

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
        addressType: useSamePath.value ? 'P2PKH' : selectedScript.value.addressType,
        mainnetAddress: allAddresses.btcMainnetAddress,
        testnetAddress: allAddresses.btcTestnetAddress,
      },
    }

    await addAccount(account)

    if (hasPassword.value) {
      successed.value = true
    }
    step.value += step.value
  } catch (e) {
    console.log(e)
    error.value = 'Failed to import your wallet'
  }
}
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
      <FlexBox d="col" class="w-82" v-if="step === 1">
        <FlexBox ai="center" :gap="3">
          <ArrowLeftIcon @click="$router.go(-1)" class="cursor-pointer" />
          <div class="text-2xl font-medium">Import Wallet</div>
        </FlexBox>
        <Tabs default-value="phrase" class="w-full mt-6">
          <TabsList class="grid grid-cols-2 bg-gray-secondary rounded-lg text-gray-primary">
            <TabsTrigger value="phrase" class="text-xs">Import from Phrase</TabsTrigger>
            <TabsTrigger value="privateKey" class="text-xs">Import from PrivateKey</TabsTrigger>
          </TabsList>
          <TabsContent value="phrase">
            <FlexBox d="col" :gap="4">
              <FlexBox d="col">
                <FlexBox ai="center" :gap="2">
                  <div class="text-gray-primary text-ss">BTC:</div>
                  <Select defaultValue="86">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a path" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="84"> Native Segwit (m/84'/0'/0') </SelectItem>
                        <SelectItem value="49"> Nested Segwit (m/49'/0'/0') </SelectItem>
                        <SelectItem value="86"> Taproot (m/86'/0'/0') </SelectItem>
                        <SelectItem value="44"> Legacy (m/44'/0'/0') </SelectItem>
                        <SelectItem value="10001"> Same as Mvc (m/44'/10001'/0') </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FlexBox>
                <FlexBox ai="center" :gap="2">
                  <div class="text-gray-primary text-ss">MVC:</div>
                  <div class="text-sm tracking-wide">
                    <span class="">m/44'/</span>
                    <input type="text" class="pit-input mx-2 w-16" v-model="mvcPath" />
                    <span class="">'/0'</span>
                  </div>
                </FlexBox>
                <FlexBox ai="center" :gap="1">
                  <span>My seed phrase has</span>
                  <Select v-model:modelValue="selectedWordsLength">
                    <SelectTrigger class="w-24 text-base">
                      <SelectValue placeholder="Select a number of words" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectGroup>
                        <SelectItem :value="length.toString()" v-for="length of wordsLengths">
                          {{ length }} words
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FlexBox>
              </FlexBox>

              <!-- input phrase -->
              <div class="grid grid-cols-2 gap-2 pr-3 -mr-3 overflow-y-auto max-h-[304px]">
                <FlexBox class="h-11 border-gray-soft border rounded-lg" v-for="(_, index) in words" ai="center">
                  <FlexBox
                    ai="center"
                    jc="center"
                    class="w-7.5 h-full text-gray-primary bg-gray-secondary rounded-l-lg"
                    >{{ index + 1 }}</FlexBox
                  >
                  <input
                    :key="index"
                    type="text"
                    v-model="words[index]"
                    @paste.prevent="onPasteWords"
                    class="h-full font-medium focus:outline-none w-full p-3 rounded-lg"
                  />
                </FlexBox>
              </div>

              <Button type="primary" class="w-61.5 mt-15 mx-auto" @click="onSubmit">Next</Button>

              <!-- error -->
              <div class="mt-4 text-center text-sm text-red-500" v-if="error">{{ error }}</div>
            </FlexBox>
          </TabsContent>
          <TabsContent value="privateKey">
            <div class="h-[450px]">
              <textarea
                placeholder="Enter your private key here"
                class="w-full h-45 focus:outline-none border border-gray-soft rounded-lg px-4 py-3.5"
              />
            </div>
            <Button type="primary" class="w-61.5 mt-15 mx-auto cursor-not-allowed opacity-50" @click="onSubmit" disabled
              >Coming soon...</Button
            >
          </TabsContent>
        </Tabs>
      </FlexBox>
      <FlexBox d="col" class="w-82" v-else-if="!hasPassword">
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
