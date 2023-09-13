<script lang="ts" setup>
import { payments } from 'bitcoinjs-lib'
import { ref } from 'vue'

import bip39 from 'bip39'
import BIP32Factory from 'bip32'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'

const bip32 = BIP32Factory(ecc)

const mne = ref(import.meta.env.VITE_TEST_MNE)
const seed = bip39.mnemonicToSeedSync(mne.value)
const root = bip32.fromSeed(seed)
const child = root.derivePath("m/86'/0'/0'/0/0")
const address = payments.p2tr({
  internalPubkey: child.publicKey.subarray(1),
}).address
</script>

<template>
  <div class="">{{ mne }}</div>
  <div class="break-all">{{ address }}</div>
</template>
