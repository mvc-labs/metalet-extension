import bip39 from 'bip39'
import BIP32Factory from 'bip32'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { mvc } from 'meta-contract'

import { raise } from './helpers'
import { networks, payments } from 'bitcoinjs-lib'

export function deriveAllPaths({ mnemonic, btcPath, mvcPath }: { mnemonic: string; btcPath: string; mvcPath: string }) {
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

export function derive({
  mnemonic,
  chain,
  network,
  path,
}: {
  mnemonic: string
  chain: 'mvc' | 'btc'
  network: 'mainnet' | 'testnet'
  path: string
}): string {
  bip39.validateMnemonic(mnemonic) ?? raise('Invalid mnemonic')

  if (chain === 'mvc') {
    return deriveMvcAddress(mnemonic, path, network)
  }

  return deriveBtcAddress(mnemonic, path, network)
}

function deriveMvcAddress(mnemonic: string, path: string, network: 'mainnet' | 'testnet'): string {
  const mneObj = mvc.Mnemonic.fromString(mnemonic)

  const hdpk = mneObj.toHDPrivateKey('', network)
  const privateKey = hdpk.deriveChild(path).privateKey

  return privateKey.toAddress(network).toString()
}

function deriveBtcAddress(mnemonic: string, path: string, network: 'mainnet' | 'testnet'): string {
  const bip32 = BIP32Factory(ecc)
  const btcNetwork = network === 'mainnet' ? networks.bitcoin : networks.testnet
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const master = bip32.fromSeed(seed, btcNetwork)

  const child = master.derivePath(path)

  // Infer address type based on path
  const addressType = inferAddressType(path)

  const publicKey = child.publicKey

  switch (addressType) {
    case 'P2PKH':
      return payments.p2pkh({ pubkey: publicKey, network: btcNetwork }).address ?? raise('Invalid address')
    case 'P2SH-P2WPKH':
    // return payments.p2sh({ pubkey: publicKey, network: btcNetwork }).address ?? raise('Invalid address')
    case 'P2WPKH':
      return payments.p2wpkh({ pubkey: publicKey, network: btcNetwork }).address ?? raise('Invalid address')
    case 'P2TR':
      return (
        payments.p2tr({ internalPubkey: publicKey.subarray(1), network: btcNetwork }).address ??
        raise('Invalid address')
      )
  }
}

function inferAddressType(path: string) {
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
