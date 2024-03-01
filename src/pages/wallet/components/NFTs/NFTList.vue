<script setup lang="ts">
import NFTItem from './NFTItem.vue'
import { ref, computed } from 'vue'
import BRC20List from './BRC20List.vue'
import NO_NFT_DATA from './NoNFTData.vue'
import { getAddress } from '@/lib/account'
import MetaContractList from './MetaContractList.vue'
import SelectorIcon from '@/assets/icons-v3/selector.svg'
import { type NFTType, getNftType, setNftType } from '@/lib/nft'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const nftType = ref<NFTType>()

getNftType().then((_nftType) => {
  nftType.value = _nftType
})

const nftTypeOnchange = (_nftType: NFTType) => {
  nftType.value = _nftType
  setNftType(_nftType)
}
</script>

<template>
  <div class="w-full">
    <div class="py-3 text-sm cursor-pointer -mx-4 bg-gray-light px-4">
      <DropdownMenu>
        <DropdownMenuTrigger class="flex items-center gap-x-2">
          <span>{{ nftType }}</span>
          <SelectorIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="bg-white">
          <DropdownMenuItem @select="nftTypeOnchange('BTC Oridinals')">BTC Oridinals</DropdownMenuItem>
          <DropdownMenuItem @select="nftTypeOnchange('MetaContract')">MetaContract</DropdownMenuItem>
          <DropdownMenuItem @select="nftTypeOnchange('MetaPin')" v-if="false">MetaPin</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <BRC20List v-if="nftType === 'BTC Oridinals'" />
    <MetaContractList v-else-if="nftType === 'MetaContract'" />
    <NO_NFT_DATA v-else />
  </div>
</template>

<style scoped lang="css"></style>
