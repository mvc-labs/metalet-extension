<script lang="ts" setup>
import Decimal from 'decimal.js'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Modal from '@/components/Modal.vue'
import { getNetwork } from '@/lib/network'
import { UseImage } from '@vueuse/components'
import { getPrivateKey } from '@/lib/account'
import { API_NET, FtManager } from 'meta-contract'
import { useMVCTokenQuery } from '@/queries/tokens'
import { useQueryClient } from '@tanstack/vue-query'
import { prettifyTokenBalance } from '@/lib/formatters'
import type { TransactionResult } from '@/global-types'
import TransactionResultModal from './components/TransactionResultModal.vue'

const route = useRoute()
const symbol = ref(route.params.symbol as string)
const genesis = ref(route.params.genesis as string)
const address = ref(route.params.address as string)

const queryClient = useQueryClient()

const error = ref<Error>()

// 用户拥有的代币资产
const { isLoading, data: asset } = useMVCTokenQuery(address, genesis, {
  enabled: computed(() => !!address.value && !genesis.value),
})

// form
const amount = ref('')
const amountInSats = computed(() => {
  if (amount.value && typeof amount.value === 'number' && asset.value) {
    return new Decimal(amount.value).times(10 ** asset.value.decimal)
  }
  return new Decimal(0)
})
const recipient = ref('')

const isOpenConfirmModal = ref(false)
const popConfirm = () => {
  isOpenConfirmModal.value = true
}
const isOpenResultModal = ref(false)
const transactionResult = ref<TransactionResult>()

const operationLock = ref(false)
async function send() {
  if (operationLock.value) return

  operationLock.value = true

  const privateKey = await getPrivateKey('mvc')

  const network = await getNetwork()

  const ftManager = new FtManager({
    network: network as API_NET,
    purse: privateKey,
  })

  // Pick the largest utxo from wallet to pay the transaction
  const largestUtxo = await ftManager.api
    .getUnspents(address.value)
    .then((utxos) => {
      return utxos.reduce((prev, curr) => {
        if (curr.satoshis > prev.satoshis) return curr
        return prev
      })
    })
    .then((utxo) => {
      // add wif to utxo
      return {
        ...utxo,
        wif: privateKey,
      }
    })

  const transferRes = await ftManager
    .transfer({
      codehash: asset.value?.codeHash!,
      genesis: asset.value?.genesis!,
      senderWif: privateKey,
      receivers: [
        {
          address: recipient.value,
          amount: amountInSats.value.toNumber().toString(),
        },
      ],
      utxos: [largestUtxo],
    })
    .catch((err) => {
      isOpenConfirmModal.value = false
      error.value = err.message
      if (err instanceof Error) {
        if (err.message === 'Too many token-utxos, should merge them to continue.') {
          transactionResult.value = {
            router: 'ft-merge',
            status: 'failed',
            message: err.message,
            confirmText: 'Merge',
          }
        }
      } else {
        transactionResult.value = {
          status: 'failed',
          message: err.message,
        }
      }

      isOpenResultModal.value = true
    })
  if (transferRes && transferRes.txid) {
    isOpenConfirmModal.value = false
    transactionResult.value = {
      chain: 'mvc',
      status: 'success',
      txId: transferRes.txid,
      fromAddress: address.value,
      toAdddress: recipient.value,
      amount: amountInSats.value.toNumber(),
      token: {
        symbol: asset.value!.symbol,
        decimal: asset.value!.decimal,
      },
    }

    isOpenResultModal.value = true

    // 刷新query
    queryClient.invalidateQueries({
      queryKey: ['tokens', { address: address.value }],
    })
  }

  operationLock.value = false
}
</script>

<template>
  <div class="mt-8 flex flex-col items-center gap-y-8" v-if="asset && genesis">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
    <UseImage :src="asset.logo" v-if="asset.logo && asset.codeHash" class="h-20 w-20 rounded-xl">
      <template #error>
        <div style="line-height: 80px" class="h-20 w-20 text-center rounded-full text-white text-3xl bg-[#1E2BFF]">
          {{ symbol[0].toLocaleUpperCase() }}
        </div>
      </template>
    </UseImage>
    <div v-else style="line-height: 80px" class="h-20 w-20 text-center rounded-full text-white text-3xl bg-[#1E2BFF]">
      {{ symbol[0].toLocaleUpperCase() }}
    </div>

    <div class="space-y-3 self-stretch">
      <!-- address input -->
      <input class="main-input w-full !rounded-xl !p-4 text-sm" placeholder="Recipient's address" v-model="recipient" />

      <!-- amount input -->
      <div class="space-y-2">
        <div class="relative">
          <input
            min="0"
            step="0.00001"
            type="number"
            v-model="amount"
            placeholder="Amount"
            class="main-input w-full !rounded-xl !py-4 !pl-4 !pr-[88px] !text-xs"
          />
          <div class="absolute right-0 top-0 flex h-full items-center justify-center text-right text-sm text-gray-500">
            <div class="border-l border-solid border-gray-500 w-20 py-1 text-center">{{ symbol }}</div>
          </div>
          <div class="absolute text-red-500 text-sm" v-if="error">{{ error?.message }}</div>
        </div>
      </div>

      <!-- balance -->
      <div class="flex items-center gap-x-2 text-xs text-gray-500">
        <div class="">Your Balance:</div>
        <div class="" v-if="isLoading">--</div>
        <div class="" v-else-if="asset.balance">
          {{ prettifyTokenBalance(asset.balance.total, asset.decimal, false, symbol) }}
        </div>
      </div>
    </div>

    <!-- send -->
    <button class="main-btn-bg w-full rounded-lg py-3 text-sm text-sky-100" @click="popConfirm">Send</button>

    <Modal v-model:is-open="isOpenConfirmModal" title="Confirm">
      <template #title>
        <div class="text-black-primary text-center">Confirm Send</div>
      </template>

      <template #body>
        <div class="mt-4 space-y-4">
          <div class="space-y-1">
            <div class="label">Amount</div>
            <div class="value">{{ amount }} {{ symbol }}</div>
          </div>
          <div class="space-y-1">
            <div class="label">Recipient Address</div>
            <div class="value break-all text-sm">{{ recipient }}</div>
          </div>
          <!-- <div class="space-y-1">
            <div class="label">Network Fee</div>
            <div class="value">100 SPACE</div>
          </div> -->
        </div>
      </template>

      <template #control>
        <div class="" v-if="operationLock">
          <div class="w-full py-3 text-center text-sm text-gray-500">Operating...</div>
        </div>
        <div class="grid grid-cols-2 gap-x-4" v-else>
          <button
            class="w-full rounded-lg border border-primary-blue bg-white py-3 text-sm text-gray-700"
            @click="isOpenConfirmModal = false"
          >
            Cancel
          </button>
          <button class="main-btn-bg w-full rounded-lg py-3 text-sm text-sky-100" @click="send">Confirm</button>
        </div>
      </template>
    </Modal>
  </div>
  <div v-else class="text-center text-gray-primary w-full py-3 text-base">Token can not found.</div>
</template>

<style lang="css" scoped>
.label {
  @apply text-sm text-gray-500;
}
</style>
