<script lang="ts" setup>
import { ref, computed, Ref } from 'vue'
import { useRoute } from 'vue-router'
import { API_NET, FtManager } from 'meta-contract'
import { CircleStackIcon } from '@heroicons/vue/24/solid'
import { useQueryClient } from '@tanstack/vue-query'

import { prettifyTokenBalance } from '@/lib/formatters'
import { getAddress, getCurrentAccount, getPrivateKey } from '@/lib/account'
import { useTokenQuery } from '@/queries/tokens'
import { network } from '@/lib/network'
import type { TransactionResult } from '@/global-types'

import Modal from '@/components/Modal.vue'
import TransactionResultModal from './components/TransactionResultModal.vue'

const route = useRoute()
const genesis = route.params.genesis as string

const queryClient = useQueryClient()

const address = ref('')
getCurrentAccount()
getAddress().then((addr) => {
  address.value = addr!
})

// form
const amount = ref('')
const amountInSats = computed(() => {
  const _amount = Number(amount.value)
  if (Number.isNaN(amount)) return 0
  return _amount * 10 ** token.value!.decimal
})
const recipient = ref('')

const isOpenConfirmModal = ref(false)
const popConfirm = () => {
  isOpenConfirmModal.value = true
}
const isOpenResultModal = ref(false)
const transactionResult: Ref<undefined | TransactionResult> = ref()

const enabled = computed(() => !!address.value)
// 用户拥有的代币资产
const { isLoading, data: token } = useTokenQuery(address, genesis, { enabled })

const operationLock = ref(false)
async function send() {
  if (operationLock.value) return

  operationLock.value = true

  const privateKey = await getPrivateKey('mvc')

  const ftManager = new FtManager({
    network: network.value as API_NET,
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
      codehash: token.value?.codehash!,
      genesis: token.value?.genesis!,
      senderWif: privateKey,
      receivers: [
        {
          address: recipient.value,
          amount: amountInSats.value.toString(),
        },
      ],
      utxos: [largestUtxo],
    })
    .catch((err) => {
      isOpenConfirmModal.value = false
      transactionResult.value = {
        status: 'failed',
        message: err.message,
      }

      isOpenResultModal.value = true
    })
  if (transferRes && transferRes.txid) {
    isOpenConfirmModal.value = false
    transactionResult.value = {
      status: 'success',
      txId: transferRes.txid,
      recipient: recipient.value,
      amount: amountInSats.value,
      token: {
        symbol: token.value!.symbol,
        decimal: token.value!.decimal,
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
  <div class="mt-8 flex flex-col items-center gap-y-8">
    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
    <img :src="token?.logo" alt="" class="h-16 w-16 rounded-xl" v-if="token?.logo" />
    <CircleStackIcon class="h-10 w-10 text-gray-300 transition-all group-hover:text-blue-500" v-else />

    <div class="space-y-3 self-stretch">
      <!-- address input -->
      <input class="main-input w-full !rounded-xl !p-4 text-sm" placeholder="Recipient's address" v-model="recipient" />

      <!-- amount input -->
      <div class="relative">
        <input class="main-input w-full !rounded-xl !py-4 !pl-4 !pr-12 text-sm" placeholder="Amount" v-model="amount" />
        <!-- unit -->
        <div
          class="absolute right-0 top-0 flex h-full items-center justify-center text-right text-xs text-gray-500"
          v-if="token?.symbol"
        >
          <div class="border-l border-solid border-gray-500 px-4 py-1">{{ token.symbol }}</div>
        </div>
      </div>

      <!-- balance -->
      <div class="flex items-center gap-x-2 text-xs text-gray-500">
        <div class="">Your Balance:</div>
        <div class="" v-if="isLoading">--</div>
        <div class="" v-else-if="token">
          {{ prettifyTokenBalance(token.total, token.decimal) + ' ' + token.symbol }}
        </div>
      </div>
    </div>

    <!-- send -->
    <button class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100" @click="popConfirm">Send</button>

    <Modal v-model:is-open="isOpenConfirmModal" title="Confirm">
      <template #title>Confirm Transaction</template>

      <template #body>
        <div class="mt-4 space-y-4">
          <div class="space-y-1">
            <div class="label">Amount</div>
            <div class="value">{{ amount }} {{ token?.symbol }}</div>
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
          <div class="w-full py-3 text-center text-sm font-bold text-gray-500">Operating...</div>
        </div>
        <div class="grid grid-cols-2 gap-x-4" v-else>
          <button
            class="w-full rounded-lg border border-primary-blue bg-white py-3 text-sm font-bold text-gray-700"
            @click="isOpenConfirmModal = false"
          >
            Cancel
          </button>
          <button class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100" @click="send">
            Confirm
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style lang="css" scoped>
.label {
  @apply text-sm text-gray-500;
}
</style>
