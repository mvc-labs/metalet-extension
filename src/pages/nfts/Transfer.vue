<script lang="ts" setup>
import { ComputedRef, computed, ref, Ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { API_NET, API_TARGET, NftManager } from 'meta-contract'

// import { getAddress, getCurrentAccount, getPrivateKey } from '@/lib/account'
import { parseMetaFile, getResizeQuery } from '@/lib/metadata'
import { useOneNftQuery } from '@/queries/nfts'
import { useNftInfoQuery } from '@/queries/metadata'
import { network } from '@/lib/network'
import { createEmit } from '@/lib/emitters'

import Modal from '@/components/Modal.vue'
import TransactionResultModal, { type TransactionResult } from './components/TransactionResultModal.vue'

const queryClient = useQueryClient()

const { codehash, genesis, tokenIndex } = defineProps<{
  codehash: string
  genesis: string
  tokenIndex: number
}>()

const address = ref('')
// getCurrentAccount()
// getAddress().then((addr) => {
//   address.value = addr!
// })
createEmit<string>('getAddress')().then((addr) => {
  address.value = addr!
})

const { isLoading: isLoadingNft, data: nft } = useOneNftQuery({
  codehash,
  genesis,
  tokenIndex,
})

const enabled = computed(() => !!nft.value?.metaTxid)

const metaTxid = computed(() => nft.value?.metaTxid) as ComputedRef<string>
const metaOutputIndex = computed(() => nft.value?.metaOutputIndex) as ComputedRef<number>
const { isLoading: isLoadingNftInfo, data: nftInfo } = useNftInfoQuery(metaTxid, metaOutputIndex, {
  enabled,
})

const coverUrl = computed(() => {
  if (!nftInfo.value || !nftInfo.value.icon) return null

  return parseMetaFile(nftInfo.value.icon) + getResizeQuery(500)
})

const recipient = ref('')

const isOpenConfirmModal = ref(false)
const isOpenResultModal = ref(false)
const operationLock = ref(false)
const transactionResult: Ref<undefined | TransactionResult> = ref()

async function transfer() {
  if (operationLock.value) return

  operationLock.value = true

  // const privateKey = await getPrivateKey("mvc")
  const privateKey = await createEmit<string>('getPrivateKey')("mvc")

  const nftManager = new NftManager({
    network: network.value as API_NET,
    apiTarget: API_TARGET.MVC,
    purse: privateKey,
  })

  // Pick the largest utxo from wallet to pay the transaction
  const largestUtxo = await nftManager.api
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

  const transferRes = await nftManager
    .transfer({
      codehash,
      genesis,
      tokenIndex: tokenIndex.toString(),
      senderWif: privateKey,
      receiverAddress: recipient.value,
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
      nft: {
        name: nftInfo.value?.name!,
        tokenIndex: tokenIndex,
        cover: coverUrl.value!,
      },
    }

    isOpenResultModal.value = true

    // 刷新query
    queryClient.invalidateQueries({
      queryKey: ['nftCollections', { address: address.value }],
    })
  }

  operationLock.value = false
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="grow">
      <div class="">
        <div class="flex items-center gap-4 rounded-md bg-gray-100 p-4" v-if="nft && nftInfo">
          <div class="h-12 w-12 overflow-hidden rounded">
            <img :src="coverUrl" class="object-cover" v-if="coverUrl" />
          </div>

          <div class="">
            <h3 class="text-sm font-bold">{{ nftInfo.name }}</h3>
            <div class="text-xs text-gray-500">{{ '# ' + nft.tokenIndex }}</div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <input class="main-input w-full !rounded-xl !p-4 !text-xs" placeholder="Recipient's address"
          v-model="recipient" />
      </div>
    </div>

    <div class="mt-4">
      <button class="main-btn-bg w-full rounded-md py-3 text-center text-base text-white disabled:opacity-50"
        :disabled="!recipient || !recipient.length" @click="isOpenConfirmModal = true">
        Confirm
      </button>
    </div>

    <Modal v-model:is-open="isOpenConfirmModal" title="Confirm">
      <template #title>Confirm Transaction</template>

      <template #body>
        <div class="mt-4 space-y-4">
          <div class="">
            <div class="flex items-center gap-4 rounded-md bg-gray-100 p-4" v-if="nft && nftInfo">
              <div class="h-12 w-12 overflow-hidden rounded">
                <img :src="coverUrl" class="object-cover" v-if="coverUrl" />
              </div>

              <div class="">
                <h3 class="text-sm font-bold">{{ nftInfo.name }}</h3>
                <div class="text-xs text-gray-500">{{ '# ' + nft.tokenIndex }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-1">
            <div class="label">Recipient Address</div>
            <div class="value break-all text-sm">{{ recipient }}</div>
          </div>
        </div>
      </template>

      <template #control>
        <div class="" v-if="operationLock">
          <div class="w-full py-3 text-center text-sm font-bold text-gray-500">Operating...</div>
        </div>
        <div class="grid grid-cols-2 gap-x-4" v-else>
          <button class="w-full rounded-lg border border-primary-blue bg-white py-3 text-sm font-bold text-gray-700"
            @click="isOpenConfirmModal = false">
            Cancel
          </button>
          <button class="main-btn-bg w-full rounded-lg py-3 text-sm font-bold text-sky-100" @click="transfer">
            Confirm
          </button>
        </div>
      </template>
    </Modal>

    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
  </div>
</template>

<style lang="css" scoped>
.label {
  @apply text-sm text-gray-500;
}
</style>
