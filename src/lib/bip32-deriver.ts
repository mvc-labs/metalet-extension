import bip39 from 'bip39'
import BIP32Factory, { BIP32Interface } from 'bip32'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { mvc } from 'meta-contract'

import { raise } from './helpers'
import { type Network } from './network'
import { networks, payments } from 'bitcoinjs-lib'

export type AddressType = 'P2WPKH' | 'P2SH-P2WPKH' | 'P2TR' | 'P2PKH'

export const scripts: {
  name: string
  path: string
  addressType: AddressType
}[] = [
  {
    name: 'Native Segwit',
    addressType: 'P2WPKH',
    path: "m/84'/0'/0'/0/0",
  },
  {
    name: 'Nested Segwit',
    addressType: 'P2SH-P2WPKH',
    path: "m/49'/0'/0'/0/0",
  },
  {
    name: 'Taproot',
    addressType: 'P2TR',
    path: "m/86'/0'/0'/0/0",
  },
  {
    name: 'Legacy',
    addressType: 'P2PKH',
    path: "m/44'/0'/0'/0/0",
  },
]

// private key
export function derivePrivateKey({
  mnemonic,
  chain,
  network,
  path,
}: {
  mnemonic: string
  chain: 'mvc' | 'btc'
  network: Network
  path: string
}): string {
  bip39.validateMnemonic(mnemonic) ?? raise('Invalid mnemonic')

  if (chain === 'mvc') {
    return deriveMvcPrivateKey(mnemonic, path, network).toString()
  }

  return deriveBtcPrivateKey(mnemonic, path, network).toWIF()
}

function deriveMvcPrivateKey(mnemonic: string, path: string, network: Network): mvc.PrivateKey {
  const mneObj = mvc.Mnemonic.fromString(mnemonic)
  const hdpk = mneObj.toHDPrivateKey('', network)

  return hdpk.deriveChild(path).privateKey
}

export function deriveBtcPrivateKey(mnemonic: string, path: string, network: Network): BIP32Interface {
  const bip32 = BIP32Factory(ecc)
  const btcNetwork = network === 'mainnet' ? networks.bitcoin : networks.testnet
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const master = bip32.fromSeed(seed, btcNetwork)

  return master.derivePath(path)
}

// public key
export function derivePublicKey({
  mnemonic,
  chain,
  network,
  path,
}: {
  mnemonic: string
  chain: 'mvc' | 'btc'
  network: Network
  path: string
}): string {
  bip39.validateMnemonic(mnemonic) ?? raise('Invalid mnemonic')

  if (chain === 'mvc') {
    return deriveMvcPublicKey(mnemonic, path, network).toString()
  }

  return deriveBtcPublicKey(mnemonic, path, network).toString('hex')
}

function deriveMvcPublicKey(mnemonic: string, path: string, network: Network): mvc.PublicKey {
  const privateKey = deriveMvcPrivateKey(mnemonic, path, network)

  return privateKey.toPublicKey()
}

function deriveBtcPublicKey(mnemonic: string, path: string, network: Network): Buffer {
  const child = deriveBtcPrivateKey(mnemonic, path, network)

  return child.publicKey
}

// address
export function deriveAllAddresses({
  mnemonic,
  btcPath,
  mvcPath,
}: {
  mnemonic: string
  btcPath: string
  mvcPath: string
}) {
  bip39.validateMnemonic(mnemonic) ?? raise('Invalid mnemonic')

  const mvcTestnetAddress = deriveMvcAddress(mnemonic, mvcPath, 'testnet')
  const mvcMainnetAddress = deriveMvcAddress(mnemonic, mvcPath, 'mainnet')
  const btcTestnetAddress = deriveBtcAddress(mnemonic, btcPath, 'testnet')
  const btcMainnetAddress = deriveBtcAddress(mnemonic, btcPath, 'mainnet')

  return {
    mvcTestnetAddress,
    mvcMainnetAddress,
    btcTestnetAddress,
    btcMainnetAddress,
  }
}

export function deriveAddress({
  mnemonic,
  chain,
  network,
  path,
}: {
  mnemonic: string
  chain: 'mvc' | 'btc'
  network: Network
  path: string
}): string {
  bip39.validateMnemonic(mnemonic) ?? raise('Invalid mnemonic')

  if (chain === 'mvc') {
    return deriveMvcAddress(mnemonic, path, network)
  }

  return deriveBtcAddress(mnemonic, path, network)
}

function deriveMvcAddress(mnemonic: string, path: string, network: Network): string {
  const privateKey = deriveMvcPrivateKey(mnemonic, path, network)

  return privateKey.toAddress(network).toString()
}

function deriveBtcAddress(mnemonic: string, path: string, network: Network): string {
  const child = deriveBtcPrivateKey(mnemonic, path, network)
  const btcNetwork = network === 'mainnet' ? networks.bitcoin : networks.testnet
  const publicKey = child.publicKey

  // Infer address type based on path
  const addressType = inferAddressType(path)

  switch (addressType) {
    case 'P2PKH':
      return payments.p2pkh({ pubkey: publicKey, network: btcNetwork }).address ?? raise('Invalid address')
    case 'P2SH-P2WPKH':
      return payments.p2sh({ redeem: payments.p2wpkh({ pubkey: publicKey }) }).address ?? raise('Invalid address')
    case 'P2WPKH':
      return payments.p2wpkh({ pubkey: publicKey, network: btcNetwork }).address ?? raise('Invalid address')
    case 'P2TR':
      return (
        payments.p2tr({ internalPubkey: publicKey.subarray(1), network: btcNetwork }).address ??
        raise('Invalid address')
      )
  }
}

export function inferAddressType(path: string): AddressType {
  const pathProtocolNumber = parseInt(path.split('/')[1].replace("'", ''), 10)
  let addressType: 'P2PKH' | 'P2SH-P2WPKH' | 'P2WPKH' | 'P2TR'
  switch (pathProtocolNumber) {
    case 44:
      addressType = 'P2PKH'
      break
    case 49:
      addressType = 'P2SH-P2WPKH'
      break
    case 84:
      addressType = 'P2WPKH'
      break
    case 86:
      addressType = 'P2TR'
      break
    default:
      addressType = 'P2PKH'
  }

  return addressType
}
