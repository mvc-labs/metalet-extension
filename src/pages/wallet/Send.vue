<script lang="ts" setup>
import Decimal from 'decimal.js'
import { Psbt } from 'bitcoinjs-lib'
import { Wallet } from 'meta-contract'
import { allAssets } from '@/data/assets'
import { BtcWallet } from '@/lib/wallets/btc'
import { useRoute, useRouter } from 'vue-router'
import { useBalanceQuery } from '@/queries/balance'
import { useQueryClient } from '@tanstack/vue-query'
import { type SymbolTicker } from '@/lib/asset-symbol'
import { prettifyBalanceFixed } from '@/lib/formatters'
import LoadingIcon from '@/assets/icons-v3/loading.svg'
import type { TransactionResult } from '@/global-types'
import { ref, computed, Ref, inject, toRaw, watch } from 'vue'
import TransactionResultModal from './components/TransactionResultModal.vue'
import { AssetLogo, Divider, FlexBox, FeeRateSelector, Button, Loading } from '@/components'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer'

const route = useRoute()
const recipient = ref('')
const error = ref<Error>()
const router = useRouter()
const txPsbt = ref<Psbt>()
const totalFee = ref<number>()
const queryClient = useQueryClient()
const currentRateFee = ref<number>()
const isOpenConfirmModal = ref(false)
const transactionResult = ref<TransactionResult>()
const address = ref(route.params.address as string)
const symbol = ref(route.params.symbol as SymbolTicker)
const asset = computed(() => allAssets.find((asset) => asset.symbol === symbol.value)!)

// amount
const amount = ref<number>()
const amountInSats = computed(() => {
  if (amount.value) {
    return new Decimal(amount.value).mul(10 ** asset.value.decimal)
  }
  return new Decimal(0)
})

// balance
const balaceQueryEnabled = computed(() => {
  return !asset.value.balance && !!address.value && !!symbol.value
})

const { data: balanceData } = useBalanceQuery(address, symbol, { enabled: balaceQueryEnabled })

const balance = computed(() => {
  if (balanceData.value) {
    return new Decimal(balanceData.value.total).div(10 ** asset.value.decimal).toNumber()
  }
})

// btn disabled
const btnDisabled = computed(() => {
  return (
    !recipient.value || !amount.value || operationLock.value || (asset.value.chain === 'btc' && !currentRateFee.value)
  )
})

const popConfirm = async () => {
  if (!recipient.value) {
    transactionResult.value = {
      status: 'warning',
      message: "Please input recipient's address.",
    }
    isOpenResultModal.value = true
    return
  }
  if (!amountInSats.value) {
    transactionResult.value = {
      status: 'warning',
      message: 'Please input amount.',
    }
    isOpenResultModal.value = true
    return
  }
  if (!currentRateFee.value && asset.value.chain === 'btc') {
    transactionResult.value = {
      status: 'warning',
      message: 'Please select fee rate.',
    }
    isOpenResultModal.value = true
    return
  }
  if (symbol.value === 'BTC') {
    operationLock.value = true
    const wallet = await BtcWallet.create()
    const result = await wallet
      .getFeeAndPsbt(recipient.value, amountInSats.value, currentRateFee.value)
      .catch((err: Error) => {
        isOpenConfirmModal.value = false
        transactionResult.value = {
          status: 'failed',
          message: err.message,
        }
        isOpenResultModal.value = true
      })
    operationLock.value = false
    if (result) {
      const { fee, psbt } = result
      txPsbt.value = psbt
      totalFee.value = fee
      isOpenConfirmModal.value = true
    }
  } else {
    isOpenConfirmModal.value = true
  }
}

watch(amountInSats, (newAmountInSats) => {
  if (balance.value && newAmountInSats && newAmountInSats.gt(balance.value || 0)) {
    error.value = new Error('Insufficient balance')
  } else {
    error.value = undefined
  }
})

const isOpenResultModal = ref(false)

const wallet = inject<Ref<Wallet>>('wallet')!

const operationLock = ref(false)

async function sendSpace() {
  const walletInstance = toRaw(wallet.value)
  const sentRes = await walletInstance.send(recipient.value, amountInSats.value.toNumber()).catch((err) => {
    isOpenConfirmModal.value = false
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }
    isOpenResultModal.value = true
  })

  return sentRes
}

async function sendBTC() {
  const wallet = await BtcWallet.create()
  if (txPsbt.value) {
    return await wallet.broadcast(txPsbt.value).catch((err: Error) => {
      isOpenConfirmModal.value = false
      transactionResult.value = {
        status: 'failed',
        message: err.message,
      }
      isOpenResultModal.value = true
    })
  } else {
    isOpenConfirmModal.value = false
    transactionResult.value = {
      status: 'failed',
      message: 'No Psbt',
    }
    isOpenResultModal.value = true
  }
}

async function send() {
  if (operationLock.value) return

  operationLock.value = true

  const sendProcessor = asset.value.symbol === 'SPACE' ? sendSpace : sendBTC
  await sendProcessor()

  isOpenConfirmModal.value = false
  operationLock.value = false
  queryClient.invalidateQueries({
    queryKey: ['balance', { address: address.value, symbol: symbol.value }],
  })
  router.push({
    name: 'SendSuccess',
    params: {
      chain: asset.value.chain,
      symbol: symbol.value,
      amount: amount.value,
      address: recipient.value,
    },
  })
}
</script>

<template>
  <FlexBox d="col" ai="center" v-if="asset" class="w-full h-full relative space-y-6">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />

    <div class="space-y-4 w-full">
      <FlexBox d="col" ai="center" :gap="3">
        <AssetLogo :logo="asset?.logo" :symbol="symbol" :chain="asset.chain" type="network" class="w-15"/>

        <div class="text-base">{{ symbol }}</div>
      </FlexBox>

      <Divider />
    </div>

    <div class="space-y-2 w-full">
      <FlexBox ai="center" jc="between">Receiver</FlexBox>
      <textarea
        v-model="recipient"
        class="w-full rounded-lg p-3 text-xs border border-gray-soft focus:border-blue-primary focus:outline-none break-all"
      />
    </div>

    <div class="space-y-2 w-full">
      <FlexBox ai="center" jc="between">
        <span>Amount</span>
        <span class="text-gray-primary text-xs">
          <span>Balance: </span>
          <span v-if="balance">{{ balance }} {{ symbol }}</span>
          <span v-else>--</span>
        </span>
      </FlexBox>
      <input
        min="0"
        type="number"
        step="0.00001"
        :max="balance"
        v-model="amount"
        class="mt-2 w-full rounded-lg p-3 text-xs border border-gray-soft focus:border-blue-primary focus:outline-none"
      />
    </div>

    <FeeRateSelector class="w-full" v-model:currentRateFee="currentRateFee" v-if="asset.chain === 'btc'" />

    <Button
      type="primary"
      @click="popConfirm"
      :disabled="!currentRateFee || !recipient"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 w-61.5 h-12"
      :class="btnDisabled ? 'opacity-50 cursor-not-allowed' : undefined"
    >
      <FlexBox ai="center" :gap="1" v-if="operationLock">
        <LoadingIcon />
        <span>Loading...</span>
      </FlexBox>
      <span v-else>Next</span>
    </Button>

    <Drawer v-model:open="isOpenConfirmModal">
      <DrawerContent class="bg-white">
        <DrawerHeader>
          <FlexBox d="col" ai="center" :gap="4">
            <AssetLogo :logo="asset.logo" :symbol="symbol" :chain="asset.chain" type="network" class="w-15"/>
            <div class="text-base">{{ amount }} {{ symbol }}</div>
          </FlexBox>
        </DrawerHeader>
        <Divider class="mt-2" />
        <div class="p-4 space-y-4 text-ss">
          <FlexBox ai="center" jc="between">
            <div class="text-gray-primary">From</div>
            <div class="break-all w-[228px]">{{ address }}</div>
          </FlexBox>
          <FlexBox ai="center" jc="between">
            <div class="text-gray-primary">To</div>
            <div class="break-all w-[228px]">{{ recipient }}</div>
          </FlexBox>
          <FlexBox ai="center" jc="between">
            <div class="text-gray-primary">Amount</div>
            <div class="break-all">{{ prettifyBalanceFixed(amount, symbol) }}</div>
          </FlexBox>
          <FlexBox ai="center" jc="between">
            <div class="text-gray-primary">Fees (Estimated)</div>
            <div>{{ prettifyBalanceFixed(totalFee, symbol, asset.decimal) }}</div>
          </FlexBox>
        </div>
        <DrawerFooter>
          <FlexBox ai="center" jc="center" :gap="2">
            <DrawerClose>
              <Button type="light" class="w-[119px] h-12">Cancel</Button>
            </DrawerClose>
            <Button type="primary" class="w-[119px] h-12" @click="send">Confirm</Button>
          </FlexBox>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </FlexBox>
  <Loading text="Asset Loading..." v-else />
</template>

<style lang="css" scoped>
.label {
  @apply text-sm text-gray-500;
}
</style>
