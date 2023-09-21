import { mvc } from 'meta-contract'
import { getCurrentAccount, getPublicKey } from './account'
import { deriveBtcPrivateKey } from './bip32-deriver'
import { getNetwork } from './network'

import { PsbtTxOutput, type Psbt, TxOutput } from 'bitcoinjs-lib'
import { Buffer } from 'buffer'
import { isTaprootInput } from 'bitcoinjs-lib/src/psbt/bip371'

import { raise } from './helpers'
import { Output } from 'bitcoinjs-lib/src/transaction'

export const DUST_UTXO_VALUE = 546
const TX_EMPTY_SIZE = 4 + 1 + 1 + 4
const TX_INPUT_BASE = 32 + 4 + 1 + 4
const TX_INPUT_PUBKEYHASH = 107
const TX_INPUT_SEGWIT = 27
const TX_INPUT_TAPROOT = 17 // round up 16.5 bytes
const TX_OUTPUT_BASE = 8 + 1
const TX_OUTPUT_PUBKEYHASH = 25
const TX_OUTPUT_SCRIPTHASH = 23
const TX_OUTPUT_SEGWIT = 22
const TX_OUTPUT_SEGWIT_SCRIPTHASH = 34

function uintOrNaN(v: any) {
  if (typeof v !== 'number') return NaN
  if (!isFinite(v)) return NaN
  if (Math.floor(v) !== v) return NaN
  if (v < 0) return NaN
  return v
}

export function sumOrNaN(txOutputs: TxOutput[] | Output[]) {
  return txOutputs.reduce(function (a: number, x: any) {
    return a + uintOrNaN(x.value)
  }, 0)
}

type PsbtInput = (typeof Psbt.prototype.data.inputs)[0]
function inputBytes(input: PsbtInput) {
  // todo: script length
  if (isTaprootInput(input)) {
    console.log('taproot input')
    return TX_INPUT_BASE + TX_INPUT_TAPROOT
  }

  if (input.witnessUtxo) return TX_INPUT_BASE + TX_INPUT_SEGWIT

  return TX_INPUT_BASE + TX_INPUT_PUBKEYHASH
}

function outputBytes(output: PsbtTxOutput) {
  return (
    TX_OUTPUT_BASE +
    (output.script
      ? output.script.length
      : output.address?.startsWith('bc1') || output.address?.startsWith('tb1')
      ? output.address?.length === 42
        ? TX_OUTPUT_SEGWIT
        : TX_OUTPUT_SEGWIT_SCRIPTHASH
      : output.address?.startsWith('3') || output.address?.startsWith('2')
      ? TX_OUTPUT_SCRIPTHASH
      : TX_OUTPUT_PUBKEYHASH)
  )
}

function transactionBytes(inputs: PsbtInput[], outputs: PsbtTxOutput[]) {
  return (
    TX_EMPTY_SIZE +
    inputs.reduce(function (a, x) {
      return a + inputBytes(x)
    }, 0) +
    outputs.reduce(function (a, x) {
      return a + outputBytes(x)
    }, 0)
  )
}

export function calcFee(psbt: Psbt, feeRate: number) {
  const inputs = psbt.data.inputs
  const outputs = psbt.txOutputs

  const bytes = transactionBytes(inputs, outputs)

  return Math.ceil(bytes * feeRate)
}

export async function getTweakedPrivateKey() {
  const network = await getNetwork()
  const account = (await getCurrentAccount()) ?? raise('No current account')

  const privateKey = deriveBtcPrivateKey(account.mnemonic, account.btc.path, network)
  const xOnlyPublicKey = await getXOnlyPublicKey()
  const tabTweaked = tapTweakHash(xOnlyPublicKey)

  return privateKey.tweak(tabTweaked)
}

export async function getXOnlyPublicKey() {
  const publicKeyStr = await getPublicKey('btc')

  return Buffer.from(publicKeyStr, 'hex').subarray(1)
}

export function tapTweakHash(pubKey: Buffer, h?: Buffer): Buffer {
  const data = Buffer.concat(h ? [pubKey, h] : [pubKey])
  const tagHash = mvc.crypto.Hash.sha256(Buffer.from('TapTweak'))
  const tag = Buffer.concat([tagHash, tagHash])

  return mvc.crypto.Hash.sha256(Buffer.concat([tag, data]))
}
