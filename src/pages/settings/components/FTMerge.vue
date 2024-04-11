<script setup lang="ts">
import { FEEB } from '@/data/config'
import { getApiHost } from '@/lib/host'
import { getNetwork } from '@/lib/network'
import type { Asset } from '@/data/assets'
import Avatar from '@/components/Avatar.vue'
import { UseImage } from '@vueuse/components'
import { useMVCAssetsQuery } from '@/queries/tokens'
import LoadingIcon from '@/components/LoadingIcon.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { getPrivateKey, getAddress } from '@/lib/account'
import { API_NET, API_TARGET, FtManager } from 'meta-contract'
import TransactionResultModal, { type TransactionResult } from '@/pages/wallet/components/TransactionResultModal.vue'

const address = ref('')
const ftManager = ref()
const operation = ref('')
const loading = ref(false)
const isRefresh = ref(true)
const currentGenesis = ref('')
const currentCodehash = ref('')
const isOpenResultModal = ref(false)
const transactionResult = ref<TransactionResult>()
const ftAsssets = ref<(Asset & { utxoCount: number })[]>([])

const NeedToMergeCount = 3
const testSplit = false

type Receiver = {
  address: string
  amount: string
}

const split = async (genesis: string, codehash: string, symbol: string, decimal: number) => {
  try {
    currentGenesis.value = genesis
    currentCodehash.value = codehash
    operation.value = 'split'
    const network: API_NET = (await getNetwork()) as API_NET
    const purse = await getPrivateKey('mvc')
    const apiHost = await getApiHost()
    const ftManager = new FtManager({
      network,
      apiTarget: API_TARGET.MVC,
      purse,
      feeb: FEEB,
      apiHost,
    })
    let receivers: Receiver[] = []
    for (let i = 0; i < 99; i++) {
      receivers.push({ address: address.value, amount: '1' })
    }
    loading.value = true
    let { txid: splitTxId } = await ftManager
      .transfer({
        genesis,
        codehash,
        receivers,
        senderWif: purse,
      })
      .catch((e) => {
        isOpenResultModal.value = true
        transactionResult.value = {
          status: 'failed',
          message: e,
        }
        throw e
      })
    isRefresh.value = true
    isOpenResultModal.value = true
    transactionResult.value = {
      chain: 'mvc',
      status: 'success',
      txId: splitTxId,
      fromAddress: address.value,
      toAdddress: address.value,
      amount: receivers.reduce((acc, cur) => acc + Number(cur.amount), 0),
      token: {
        symbol: symbol,
        decimal,
      },
    }
  } catch (error) {
    transactionResult.value = {
      status: 'failed',
      message: error as string,
    }
  } finally {
    loading.value = true
  }
}

const merge = async (genesis: string, codehash: string) => {
  try {
    currentGenesis.value = genesis
    currentCodehash.value = codehash
    operation.value = 'merge'
    const network: API_NET = (await getNetwork()) as API_NET
    const purse = await getPrivateKey('mvc')
    const apiHost = await getApiHost()
    const ftManager = new FtManager({
      network,
      apiTarget: API_TARGET.MVC,
      purse,
      feeb: FEEB,
      apiHost,
    })
    loading.value = true
    const { txids } = await ftManager
      .totalMerge({
        genesis,
        codehash,
        ownerWif: purse,
      })
      .catch((e) => {
        isOpenResultModal.value = true
        transactionResult.value = {
          status: 'failed',
          message: e,
        }
        throw e
      })
    isRefresh.value = true
    isOpenResultModal.value = true
    transactionResult.value = {
      chain: 'mvc',
      status: 'successTxs',
      txIds: txids,
    }
  } catch (error) {
    transactionResult.value = {
      status: 'failed',
      message: error as string,
    }
  } finally {
    loading.value = false
  }
}

getAddress('mvc').then((_address) => {
  address.value = _address
})

const { isLoading, data: mvcAssets } = useMVCAssetsQuery(address, {
  enabled: computed(() => !!address.value),
  autoRefresh: true,
})

// TODO: Change computed
watch(
  [mvcAssets, ftManager, isRefresh],
  ([assets, manager, _isRefresh]) => {
    if (manager && assets && _isRefresh) {
      ftAsssets.value = []
      for (let asset of assets || []) {
        const { codeHash, genesis } = asset
        manager.api.getFungibleTokenUnspents(codeHash, genesis, address.value).then((data: any) => {
          ftAsssets.value.push({
            ...asset,
            utxoCount: data.length,
          })
          isRefresh.value = false
        })
      }
    }
  },
  { immediate: true }
)

const hasMergeToken = computed(() => {
  return ftAsssets.value.some((asset) => asset.utxoCount > NeedToMergeCount)
})

onMounted(async () => {
  const network: API_NET = (await getNetwork()) as API_NET
  const purse = await getPrivateKey('mvc')
  const apiHost = await getApiHost()
  ftManager.value = new FtManager({
    network,
    apiTarget: API_TARGET.MVC,
    purse,
    feeb: FEEB,
    apiHost,
  })
})
</script>

<template>
  <div>
    <div class="text-2xl font-medium">FT Merge</div>
    <div class="mt-2 text-gray-primary text-xs">
      Due to the technical characteristics of UTXO, when there are too many UTXOs of a certain token, problems such as
      cycle failure will occur. The merge tool will automatically help you merge scattered UTXOs into one.
    </div>
    <div class="mt-4 py-3 flex gap-3 items-center">
      <Avatar :id="address" />
      <div class="flex flex-col gap-1">
        <div class="text-sm font-medium">MVC Address</div>
        <div class="text-gray-primary text-xs">{{ address }}</div>
      </div>
    </div>
    <div class="-mx-5 px-5 bg-gray-light py-3">Token</div>
    <div class="py-16 text-center" v-if="isLoading">Token List Loading...</div>
    <div class="py-3" v-for="(asset, index) in ftAsssets" :key="index" v-else-if="hasMergeToken">
      <div class="flex items-center justify-between" v-if="asset.utxoCount > NeedToMergeCount">
        <div class="flex items-center gap-3">
          <UseImage :src="asset.logo" v-if="asset.logo && asset.codeHash" class="h-10 w-10 rounded-md">
            <template #error>
              <div class="h-10 w-10 text-center leading-10 rounded-full text-white text-base bg-[#1E2BFF]">
                {{ asset.symbol[0].toLocaleUpperCase() }}
              </div>
            </template>
          </UseImage>
          <div class="flex flex-col gap-1">
            <span class="text-sm">{{ asset.tokenName }}</span>
            <span class="text-gray-primary text-xs">UTXO Count:{{ asset.utxoCount }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="testSplit"
            :disabled="loading"
            @click="split(asset.genesis!, asset.codeHash!, asset.symbol, asset.decimal)"
            :class="[
              { 'cursor-not-allowed': loading },
              'text-primary-blue py-2 px-4 rounded-3xl bg-blue-light text-xs',
            ]"
          >
            <div class="flex items-center gap-1 w-12 justify-center">
              <LoadingIcon
                class="w-4 text-primary-blue"
                v-if="
                  loading &&
                  currentGenesis === asset.genesis &&
                  currentCodehash === asset.codeHash &&
                  operation === 'split'
                "
              />
              <span>Split</span>
            </div>
          </button>
          <button
            :disabled="loading"
            @click="merge(asset.genesis!, asset.codeHash!)"
            :class="[
              { 'cursor-not-allowed': loading },
              'text-primary-blue py-2 px-4 rounded-3xl bg-blue-light text-xs',
            ]"
          >
            <div class="flex items-center gap-1 w-14 justify-center">
              <LoadingIcon
                class="w-4 text-primary-blue"
                v-if="
                  loading &&
                  currentGenesis === asset.genesis &&
                  currentCodehash === asset.codeHash &&
                  operation === 'merge'
                "
              />
              <span>Merge</span>
            </div>
          </button>
        </div>
      </div>
    </div>
    <div class="py-16 text-center text-gray-primary" v-else>No Token need to merge.</div>

    <TransactionResultModal v-model:is-open-result="isOpenResultModal" :result="transactionResult" />
  </div>
</template>

<style lang="css" scoped>
.label {
  @apply text-sm  text-gray-500;
}

.value {
  @apply text-sm text-gray-700;
}
</style>
