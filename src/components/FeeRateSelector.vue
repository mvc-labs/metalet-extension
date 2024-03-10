<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CloseIcon from '@/assets/icons-v3/close.svg'
import SelectIcon from '@/assets/icons-v3/select_active.svg'
import ArrowRightIcon from '@/assets/icons-v3/arrow_right.svg'
import { FlexBox, Divider, Button, Loading } from '@/components'
import { type FeeRate, useBTCRateQuery } from '@/queries/transaction'
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

const isCustom = ref(false)
const selectedIndex = ref(-1)
const feeRate = ref<number>()
const emit = defineEmits(['update:currentRateFee'])

const { isLoading, data: rateList } = useBTCRateQuery()

const rateOnChange = (_feeRate: number | undefined, index: number) => {
  feeRate.value = _feeRate
  selectedIndex.value = index
  emit('update:currentRateFee', _feeRate)
}

watch(
  rateList,
  (newRateList) => {
    if (newRateList) {
      const _selectedIndex = newRateList.findIndex((item) => item.title === 'Avg')
      if (_selectedIndex !== -1) {
        const _feeRate = newRateList[_selectedIndex].feeRate
        rateOnChange(_feeRate, _selectedIndex)
      }
    }
  },
  { immediate: true }
)

const selectRateFee = (rateFee: number, index: number) => {
  isCustom.value = false
  rateOnChange(rateFee, index)
}

const selectCustom = () => {
  isCustom.value = true
  rateOnChange(undefined, -1)
}
</script>

<template>
  <FlexBox ai="center" jc="between">
    <span class="text-sm">Fee Rate</span>
    <Drawer>
      <DrawerTrigger>
        <FlexBox ai="center" jc="center" class="text-xs text-gray-primary">
          <span>{{ feeRate }} sat/vB</span>
          <ArrowRightIcon />
        </FlexBox>
      </DrawerTrigger>
      <DrawerContent class="bg-white">
        <DrawerHeader class="pt-1.5 pb-3.5">
          <DrawerTitle class="text-center text-sm relative">
            <span>Select Fee Rate</span>
            <DrawerClose>
              <CloseIcon class="absolute top-0 right-0 cursor-pointer" />
            </DrawerClose>
          </DrawerTitle>
        </DrawerHeader>
        <Loading v-if="isLoading" text="Fee Rate Loading..." />
        <div class="p-4" v-else>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <FlexBox
              d="col"
              :gap="1"
              ai="center"
              jc="center"
              v-for="(rate, index) in rateList"
              @click="selectRateFee(rate.feeRate, index)"
              class="rounded-md border cursor-pointer aspect-square relative"
              :class="index === selectedIndex ? 'border-blue-primary' : 'border-gary-soft'"
            >
              <div class="text-xs">{{ rate.title }}</div>
              <div class="text-sm">{{ rate.feeRate }} sat/vB</div>
              <div class="text-xs text-gray-primary">{{ rate.desc }}</div>
              <SelectIcon class="absolute top-0 right-0" v-if="index === selectedIndex" />
            </FlexBox>
          </div>
          <FlexBox
            d="col"
            ai="start"
            jc="center"
            :gap="2"
            @click="selectCustom"
            class="rounded-md border cursor-pointer mt-2 h-18 px-3 relative"
            :class="isCustom ? 'border-blue-primary' : 'border-gary-soft'"
          >
            <div class="text-xs">Custom Fee Rate</div>
            <input
              min="1"
              type="number"
              placeholder="sat/vB"
              class="border-none focus:outline-none w-full text-xs"
              @input="(e) => rateOnChange(Number((e.currentTarget as HTMLInputElement).value), -1)"
            />
            <SelectIcon class="absolute top-0 right-0" v-if="isCustom" />
          </FlexBox>
        </div>
        <DrawerFooter>
          <DrawerClose><Button type="primary" class="mx-auto w-[246px] h-12">Comfirm</Button></DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </FlexBox>
</template>

<style scoped lang="css"></style>
