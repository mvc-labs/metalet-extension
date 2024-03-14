<script lang="ts" setup>
import { computed } from 'vue'
import { toTx } from '@/lib/helpers'
import { FlexBox } from '@/components'
import { type Chain } from '@/lib/account'
import { type Asset } from '@/data/assets'
import { getBrowserHost } from '@/lib/host'
import AssetLogo from '@/components/AssetLogo.vue'
import type { Activity } from '@/queries/activities'
import LoadingIcon from '@/assets/icons-v3/loading.svg'
import { prettifyTimestamp, prettifyTxId } from '@/lib/formatters'

const props = defineProps<{
  asset: Asset
  activity: Activity
}>()

const flow = computed(() => {
  const { outcome, income } = props.activity
  return outcome > income ? 'Send' : 'Receive'
})

const isConfirmed = computed(() => {
  if (props.asset?.contract === 'BRC-20') {
    return true
  }
  return props.activity.height !== -1
})

const difference = computed(() => {
  const { outcome, income } = props.activity
  const { symbol, decimal } = props.asset
  let display
  let displayClass

  if (outcome > income) {
    display = `-${(outcome - income) / 10 ** decimal} ${symbol}`
    displayClass = 'text-red-700'
  } else if (outcome < income) {
    display = `+${(income - outcome) / 10 ** decimal} ${symbol}`
    displayClass = 'text-green-700'
  } else {
    display = '-'
    displayClass = 'text-gray-500'
  }

  return {
    display,
    displayClass,
  }
})

const toActivityTx = async () => {
  const { txid } = props.activity
  const chain = props.asset.chain as Chain
  const host = await getBrowserHost(chain)
  toTx(txid, host as string)
}
</script>

<template>
  <FlexBox ai="center" jc="between" class="py-3">
    <FlexBox ai="center" :gap="3">
      <AssetLogo
        :symbol="asset.symbol"
        :chain="asset.chain"
        :logo="asset.logo"
        type="activity"
        class="w-[38px] text-lg"
        :flow="flow"
      />
      <div>
        <div :class="['text-sm space-x-2', !isConfirmed ? 'text-orange-primary' : undefined]">
          <LoadingIcon v-if="!isConfirmed" />
          <span>{{ flow }}</span>
        </div>
        <div class="text-gray-primary text-xs">{{ prettifyTimestamp(activity.time) }}</div>
      </div>
    </FlexBox>
    <FlexBox d="col" ai="end">
      <div class="text-sm">{{ difference.display }}</div>
      <div class="text-xs text-gray-primary"> {{ prettifyTxId(activity.txid) }}</div>
    </FlexBox>
  </FlexBox>
  <!-- <div class="w-full py-3">

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-x-2 text-green-500" v-if="isConfirmed">
        <div class="h-2 w-2 rounded-full bg-green-500"></div>
        <div>Confirmed</div>
      </div>

      <div class="flex items-center gap-x-2 text-red-500" v-else>
        <div class="h-2 w-2 rounded-full bg-red-500"></div>
        <div>Unconfirmed</div>
      </div>
      <div :class="['text-sm text-gray-500']">{{ prettifyTimestamp(activity.time) }}</div>
    </div>

    <div :class="[difference.displayClass, 'text-right  text-lg font-bold']">{{ difference.display }}</div>

    <div class="flex items-center justify-end gap-x-2">
      <div class="cursor-pointer text-xs text-gray-400 hover:underline" @click="toActivityTx">
        {{ prettifyTxId(activity.txid) }}
      </div>
    </div>
  </div> -->
</template>
