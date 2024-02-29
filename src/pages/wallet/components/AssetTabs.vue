<script setup>
import AssetList from './AssetList.vue'
import NFTList from './NFT/NFTList.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>

<template>
  <div class="border-t border-primary-teal border-opacity-10 pt-4">
    <Tabs default-value="Cypto" class="w-full">
      <TabsList class="w-full">
        <TabsTrigger value="Cypto">Cypto</TabsTrigger>
        <TabsTrigger value="NFTs"> NFTs</TabsTrigger>
        <TabsTrigger value="Activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="Cypto">
        <AssetList />
      </TabsContent>
      <TabsContent value="NFTs">
        <NFTList />
      </TabsContent>
      <TabsContent value="Activity"></TabsContent>
    </Tabs>
  </div>
</template>

<style scoped lang="css">
div[role='tablist'] {
  @apply p-0 justify-start gap-6;
}

button[role='tab'] {
  @apply text-gray-primary p-0;
}

button[role='tab'][aria-selected='true'] {
  @apply bg-tab-selected text-transparent bg-clip-text shadow-none;
}
</style>
