<script lang="ts" setup>
// import WalletIcon from '../../assets/icons/wallet.svg?component'
import NftIcon from '../../assets/icons/nft.svg?component'
// import ExchangeIcon from '../../assets/icons/exchange.svg?component'
// import SettingsIcon from '../../assets/icons/settings.svg?component'
import { WalletIcon, Cog6ToothIcon, ArrowsRightLeftIcon, CircleStackIcon } from '@heroicons/vue/24/solid'
</script>

<template>
  <footer
    class="fixed bottom-0 left-0 right-0 h-14 border-t border-gray-200 bg-white backdrop-blur-sm sm:absolute sm:rounded-b-lg"
  >
    <div class="grid h-full grid-cols-2 items-stretch justify-center">
      <router-link class="link" active-class="!text-blue-600" to="/wallet">
        <WalletIcon class="icon" />
      </router-link>
      <!-- <router-link class="link" to="/collections" active-class="!text-blue-600">
        <NftIcon class="h-6 w-8" />
      </router-link> -->

      <!-- <router-link class="link" to="tokens">
        <ArrowsRightLeftIcon class="icon" />
      </router-link> -->

      <router-link class="link" to="/settings" active-class="!text-blue-600">
        <Cog6ToothIcon class="icon" />
      </router-link>
    </div>
  </footer>
</template>

<style lang="css" scoped>
.link {
  @apply flex cursor-pointer items-center justify-center text-gray-300 transition duration-200 ease-in-out hover:text-blue-600;
}

.icon {
  @apply h-6 w-6;
}
</style>
