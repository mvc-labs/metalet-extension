<script lang="ts" setup>
import { ref, computed } from 'vue'
import { getTags } from '@/data/assets'
import type { Psbt } from 'bitcoinjs-lib'
import { BtcWallet } from '@/lib/wallets/btc'
import CopyIcon from '@/assets/icons/copy.svg'
import { useRoute, useRouter } from 'vue-router'
import { SymbolTicker } from '@/lib/asset-symbol'
import { useBRC20AssetQuery } from '@/queries/btc'
import { useQueryClient } from '@tanstack/vue-query'
import { getInscriptionUtxo } from '@/queries/utxos'
import LoadingIcon from '@/assets/icons-v3/loading.svg'
import { prettifyBalanceFixed, shortestAddress } from '@/lib/formatters'
import { AssetLogo, Divider, FlexBox, FeeRateSelector, Button } from '@/components'
import TransactionResultModal, { type TransactionResult } from './components/TransactionResultModal.vue'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const route = useRoute()
const router = useRouter()
const isShowComfirm = ref(false)
const queryClient = useQueryClient()

const amount = ref(Number(route.params.amount))
const address = ref<string>(route.params.address as string)
const symbol = ref<SymbolTicker>(route.params.symbol as SymbolTicker)
const inscriptionId = ref<string>(route.params.inscriptionId as string)

const { data: btcAssets } = useBRC20AssetQuery(address, { enabled: computed(() => !!address.value) })

const asset = computed(() => {
  if (btcAssets.value) {
    const asset = btcAssets.value.find((asset) => asset.symbol === symbol.value)
    if (!asset) {
      router.go(-1)
      return
    }
    return asset
  }
})

const tags = computed(() => {
  if (asset.value) {
    return getTags(asset.value)
  }
})

const recipient = ref('')
const operationLock = ref(false)
const currentRateFee = ref<number>()
const calcFee = ref<number>()
const txPsbt = ref<Psbt>()

const isOpenResultModal = ref(false)

const transactionResult = ref<TransactionResult | undefined>()

async function next() {
  if (operationLock.value) return

  if (!currentRateFee.value) {
    transactionResult.value = {
      status: 'warning',
      message: 'Please select fee rate.',
    }
    isOpenResultModal.value = true
    return
  }

  operationLock.value = true

  const utxo = await getInscriptionUtxo(inscriptionId.value)

  const wallet = await BtcWallet.create()
  const info = await wallet.getBRCFeeAndPsbt(recipient.value, utxo, currentRateFee.value).catch((err: Error) => {
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }
    isOpenResultModal.value = true
    operationLock.value = false
  })

  if (info) {
    const { fee, psbt } = info
    calcFee.value = fee
    txPsbt.value = psbt
    operationLock.value = false
    isShowComfirm.value = true
  }
}

async function send() {
  if (!txPsbt.value) {
    transactionResult.value = {
      status: 'warning',
      message: 'No Psbt.',
    }
    isOpenResultModal.value = true
    return
  }

  const wallet = await BtcWallet.create()
  await wallet.broadcast(txPsbt.value).catch((err: Error) => {
    transactionResult.value = {
      status: 'failed',
      message: err.message,
    }
    isOpenResultModal.value = true
  })

  isShowComfirm.value = false
  operationLock.value = false
  queryClient.invalidateQueries({
    queryKey: ['balance', { address: address.value, symbol: symbol.value }],
  })

  router.push({
    name: 'SendSuccess',
    params: {
      chain: 'btc',
      symbol: symbol.value,
      amount: amount.value,
      address: recipient.value,
    },
  })
}
</script>

<template>
  <div class="space-y-6 h-full relative">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />

    <div class="space-y-4">
      <FlexBox d="col" ai="center">
        <AssetLogo :logo="asset?.logo" :symbol="symbol" chain="btc" type="network" />

        <div class="mt-3 text-base">{{ symbol }}</div>

        <div class="space-x-1">
          <div v-for="tag in tags" :key="tag.name" :class="['text-gray-primary', 'text-xs']">
            {{ tag.name }}
          </div>
        </div>
      </FlexBox>

      <Divider />
    </div>

    <div class="space-y-2">
      <div>Receiver</div>
      <textarea
        v-model="recipient"
        class="w-full rounded-lg p-3 text-xs border border-gray-soft focus:border-blue-primary focus:outline-none break-all"
      />
    </div>
    <div class="space-y-2">
      <div>Amount</div>
      <div class="w-full rounded-lg p-3 text-xs border border-gray-soft focus:border-blue-primary focus:outline-none">
        {{ amount }} {{ symbol }}
      </div>
    </div>
    <FeeRateSelector class="mt-6" v-model:currentRateFee="currentRateFee" />

    <Button
      type="primary"
      @click="next"
      :disabled="!currentRateFee || !recipient"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 w-61.5 h-12"
      :class="!currentRateFee || !recipient || operationLock ? 'opacity-50 cursor-not-allowed' : undefined"
    >
      <FlexBox ai="center" :gap="1" v-if="operationLock">
        <LoadingIcon />
        <span>Loading...</span>
      </FlexBox>
      <span v-else>Next</span>
    </Button>

    <Drawer v-model:open="isShowComfirm">
      <DrawerContent class="bg-white">
        <DrawerHeader>
          <FlexBox d="col" ai="center" :gap="4">
            <AssetLogo :logo="asset?.logo" :symbol="symbol" chain="btc" type="network" />
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
            <div class="break-all">{{ amount }}</div>
          </FlexBox>
          <FlexBox ai="center" jc="between">
            <div class="text-gray-primary">Fees (Estimated)</div>
            <div>{{ prettifyBalanceFixed(calcFee || 0, 'BTC', 8) }}</div>
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
  </div>
</template>

<style lang="css" scoped></style>
