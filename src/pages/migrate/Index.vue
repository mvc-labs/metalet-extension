<script lang="ts" setup>
import { mvc } from 'meta-contract'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { addAccount, getAccounts, getLegacyAccounts } from '@/lib/account'
import { setNetwork } from '@/lib/network'
import { deriveAllAddresses, type AddressType } from '@/lib/bip32-deriver'

import MetaletLogoImg from '@/assets/images/metalet-logo.png?url'

const router = useRouter()

const error = ref('')
const importWallet = async () => {
  // 如果是老用户（sync存储中有助记词），且该账号在localStorage中不存在，则说明需要迁移，跳转至新版本迁移页面
  const oldRecord = await chrome.storage.sync.get('currentAccount')
  const v1Records = await getLegacyAccounts()
  if (oldRecord && oldRecord.currentAccount && oldRecord.currentAccount.mnemonicStr && !v1Records.length) {
    const mneStr = oldRecord.currentAccount.mnemonicStr

    // 比照查看有无该助记词的账号
    const accounts = await getAccounts()
    const accountsArr = Array.from(accounts.values())
    const hasAccount = accountsArr.some((account) => account.mnemonic === mneStr)

    if (!hasAccount) {
      // 迁移过程
      // 在localStorage中存储老账号
      try {
        const mnemonicStr = oldRecord.currentAccount.mnemonicStr
        const address = oldRecord.currentAccount.address
        const mneObj = mvc.Mnemonic.fromString(mnemonicStr)

        // 从其地址推断他的path
        let usingPath: string = ''
        let network: 'mainnet' | 'testnet' = 'mainnet'
        const commonPaths = ['236', '10001']
        for (const path of commonPaths) {
          network = address.startsWith('1') ? 'mainnet' : 'testnet'
          const hdpk = mneObj.toHDPrivateKey('', network)
          const privateKey = hdpk.deriveChild(`m/44'/${path}'/0'/0/0`).privateKey
          const derivedAddress = privateKey.toAddress(network).toString()
          if (address === derivedAddress) {
            usingPath = path
            break
          }
        }
        if (!usingPath) {
          throw new Error('Cannot find the path of the original account')
        }

        const fullPath = `m/44'/${usingPath}'/0'/0/0`
        const btcPath = fullPath

        const allAddresses = deriveAllAddresses({
          mnemonic: mnemonicStr,
          btcPath,
          mvcPath: fullPath,
        })

        // construct new account object
        const account = {
          mnemonic: mnemonicStr,
          assetsDisplay: ['SPACE', 'BTC'],
          mvc: {
            path: fullPath,
            addressType: 'P2PKH' as AddressType,
            mainnetAddress: allAddresses.mvcMainnetAddress,
            testnetAddress: allAddresses.mvcTestnetAddress,
          },
          btc: {
            path: btcPath,
            addressType: 'P2PKH' as AddressType,
            mainnetAddress: allAddresses.btcMainnetAddress,
            testnetAddress: allAddresses.btcTestnetAddress,
          },
        }

        await addAccount(account)

        // 根据用户使用的网络，设置当前网络环境
        await setNetwork(network)

        // // 跳转到首页
        router.push('/wallet')
      } catch (e: any) {
        error.value = e.message
      }
    }
  }
}
</script>

<template>
  <div class="flex h-full flex-col justify-between text-center">
    <div class="">
      <div class="mt-12">
        <img class="mx-auto h-24 w-24" :src="MetaletLogoImg" alt="metalet-logo" />
      </div>

      <div class="mt-4">
        <div class="flex items-end justify-center gap-x-2">
          <h1 class="text-3xl font-extrabold leading-none">Metalet</h1>
          <span class="text-base  leading-none text-amber-500">v2.0</span>
        </div>

        <p class="mt-2 text-gray-500">Welcome Back!</p>
      </div>
    </div>

    <div class="flex flex-col items-stretch pb-4">
      <p class="mb-2 text-sm text-red-500" v-if="error">{{ error }}</p>
      <button
        class="gradient-bg rounded-md py-4 text-base  leading-none tracking-wide text-blue-50"
        @click="importWallet"
      >
        OK
      </button>
    </div>
  </div>
</template>
