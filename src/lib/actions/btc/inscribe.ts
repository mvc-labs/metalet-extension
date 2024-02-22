import { randomBytes } from 'crypto'
import { sleep } from '@/lib/helpers'
import * as bitcoin from './bitcoinjs-lib'
import { getBtcUtxos } from '@/queries/utxos'
import { getBtcNetwork } from '@/lib/network'
import * as bcrypto from './bitcoinjs-lib/crypto'
import { base, signUtil } from '@okxweb3/crypto-lib'
import BIP32Factory, { BIP32Interface } from 'bip32'
import { getAddress, getSigner } from '@/lib/account'
import { broadcastBTCTx } from '@/queries/transaction'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { vectorSize } from './bitcoinjs-lib/transaction'
import { getAddressType, private2public, sign } from './txBuild'

const schnorr = signUtil.schnorr.secp256k1.schnorr

// export type InscriptionData = {
//   contentType: string
//   body: string | Buffer
//   revealAddr: string
// }

export type Operation = 'init' | 'create' | 'modify' | 'revoke'

export type MetaidData = {
  body?: string | Buffer
  operation: Operation
  path?: string
  contentType?: string
  encryption?: '0' | '1' | '2'
  version?: string
  encoding?: string
  revealAddr: string
}

export type PrevOutput = {
  txId: string
  vOut: number
  amount: number
  address: string
}

export type InscriptionRequest = {
  commitTxPrevOutputList: PrevOutput[]
  commitFeeRate: number
  revealFeeRate: number
  // inscriptionDataList: InscriptionData[]
  metaidDataList: MetaidData[]
  revealOutValue: number
  changeAddress: string
  minChangeValue?: number
  shareData?: string
  masterPublicKey?: string
  chainCode?: string
  commitTx?: string
  signatureList?: string[]
}

export type InscribeTxs = {
  commitTx: string
  revealTxs: string[]
  commitTxFee: number
  revealTxFees: number[]
  commitAddrs: string[]
}

export type TxOut = {
  pkScript: Buffer
  value: number
}

type InscriptionTxCtxData = {
  // privateKey: Buffer
  inscriptionScript: Buffer
  commitTxAddress: string
  commitTxAddressPkScript: Buffer
  witness: Buffer[]
  hash: Buffer
  revealTxPrevOutput: TxOut
  revealPkScript: Buffer
}

const defaultTxVersion = 2
const defaultSequenceNum = 0xfffffffd
const defaultRevealOutValue = 546
const defaultMinChangeValue = 546

const maxStandardTxWeight = 4000000 / 10

export class InscriptionTool {
  network: bitcoin.Network = bitcoin.networks.bitcoin
  inscriptionTxCtxDataList: InscriptionTxCtxData[] = []
  revealTxs: bitcoin.Transaction[] = []
  commitTx: bitcoin.Transaction = new bitcoin.Transaction()
  commitTxPrevOutputFetcher: number[] = []
  revealTxPrevOutputFetcher: number[] = []
  mustCommitTxFee: number = 0
  mustRevealTxFees: number[] = []
  commitAddrs: string[] = []

  static newInscriptionTool(network: bitcoin.Network, request: InscriptionRequest, keyPairs: BIP32Interface) {
    const tool = new InscriptionTool()
    tool.network = network

    const revealOutValue = request.revealOutValue || defaultRevealOutValue
    const minChangeValue = request.minChangeValue || defaultMinChangeValue

    const bip32 = BIP32Factory(ecc)
    const randomKeyPairs = bip32.fromSeed(randomBytes(64), network)

    request.metaidDataList.forEach((metaidData) => {
      tool.inscriptionTxCtxDataList.push(createMetaIdTxCtxData(network, metaidData, randomKeyPairs.publicKey))
    })

    const totalRevealPrevOutputValue = tool.buildEmptyRevealTx(network, revealOutValue, request.revealFeeRate)
    const insufficient = tool.buildCommitTx(
      network,
      request.commitTxPrevOutputList,
      request.changeAddress,
      totalRevealPrevOutputValue,
      request.commitFeeRate,
      minChangeValue,
      keyPairs.privateKey!
    )
    if (insufficient) {
      return tool
    }
    tool.signCommitTx(request.commitTxPrevOutputList, keyPairs.privateKey!)
    tool.completeRevealTx(randomKeyPairs.privateKey!)

    return tool
  }

  buildEmptyRevealTx(network: bitcoin.Network, revealOutValue: number, revealFeeRate: number) {
    let totalPrevOutputValue = 0
    const revealTxs: bitcoin.Transaction[] = []
    const mustRevealTxFees: number[] = []
    const commitAddrs: string[] = []
    this.inscriptionTxCtxDataList.forEach((inscriptionTxCtxData, i) => {
      const tx = new bitcoin.Transaction()
      tx.version = defaultTxVersion

      tx.addInput(Buffer.alloc(32), i, defaultSequenceNum)
      tx.addOutput(inscriptionTxCtxData.revealPkScript, revealOutValue)

      const emptySignature = Buffer.alloc(64)
      const emptyControlBlockWitness = Buffer.alloc(33)
      const txWitness: Buffer[] = []
      txWitness.push(emptySignature)
      txWitness.push(inscriptionTxCtxData.inscriptionScript)
      txWitness.push(emptyControlBlockWitness)
      const fee = Math.floor((tx.byteLength() + Math.floor((vectorSize(txWitness) + 2 + 3) / 4)) * revealFeeRate)

      const prevOutputValue = revealOutValue + fee
      inscriptionTxCtxData.revealTxPrevOutput = {
        pkScript: inscriptionTxCtxData.commitTxAddressPkScript,
        value: prevOutputValue,
      }

      totalPrevOutputValue += prevOutputValue
      revealTxs.push(tx)
      mustRevealTxFees.push(fee)
      commitAddrs.push(inscriptionTxCtxData.commitTxAddress)
    })

    this.revealTxs = revealTxs
    this.mustRevealTxFees = mustRevealTxFees
    this.commitAddrs = commitAddrs

    return totalPrevOutputValue
  }

  buildCommitTx(
    network: bitcoin.Network,
    commitTxPrevOutputList: PrevOutput[],
    changeAddress: string,
    totalRevealPrevOutputValue: number,
    commitFeeRate: number,
    minChangeValue: number,
    privateKey: Buffer
  ): boolean {
    let totalSenderAmount = 0

    const tx = new bitcoin.Transaction()
    tx.version = defaultTxVersion

    commitTxPrevOutputList.forEach((commitTxPrevOutput) => {
      const hash = base.reverseBuffer(base.fromHex(commitTxPrevOutput.txId))
      tx.addInput(hash, commitTxPrevOutput.vOut, defaultSequenceNum)
      this.commitTxPrevOutputFetcher.push(commitTxPrevOutput.amount)
      totalSenderAmount += commitTxPrevOutput.amount
    })

    this.inscriptionTxCtxDataList.forEach((inscriptionTxCtxData) => {
      tx.addOutput(inscriptionTxCtxData.revealTxPrevOutput.pkScript, inscriptionTxCtxData.revealTxPrevOutput.value)
    })

    const changePkScript = bitcoin.address.toOutputScript(changeAddress, network)
    tx.addOutput(changePkScript, 0)

    const txForEstimate = tx.clone()
    signTx(txForEstimate, commitTxPrevOutputList, this.network, privateKey)

    const fee = Math.floor(txForEstimate.virtualSize() * commitFeeRate)
    const changeAmount = totalSenderAmount - totalRevealPrevOutputValue - fee
    if (changeAmount >= minChangeValue) {
      tx.outs[tx.outs.length - 1].value = changeAmount
    } else {
      tx.outs = tx.outs.slice(0, tx.outs.length - 1)
      txForEstimate.outs = txForEstimate.outs.slice(0, txForEstimate.outs.length - 1)
      const feeWithoutChange = Math.floor(txForEstimate.virtualSize() * commitFeeRate)
      if (totalSenderAmount - totalRevealPrevOutputValue - feeWithoutChange < 0) {
        this.mustCommitTxFee = fee
        return true
      }
    }

    this.commitTx = tx
    return false
  }

  signCommitTx(commitTxPrevOutputList: PrevOutput[], privateKey: Buffer) {
    signTx(this.commitTx, commitTxPrevOutputList, this.network, privateKey)
  }

  completeRevealTx(privateKey: Buffer) {
    this.revealTxs.forEach((revealTx, i) => {
      revealTx.ins[0].hash = this.commitTx.getHash()

      const prevOutScripts = [this.inscriptionTxCtxDataList[i].revealTxPrevOutput.pkScript]
      const values = [this.inscriptionTxCtxDataList[i].revealTxPrevOutput.value]

      this.revealTxPrevOutputFetcher.push(this.inscriptionTxCtxDataList[i].revealTxPrevOutput.value)

      const hash = revealTx.hashForWitnessV1(
        0,
        prevOutScripts,
        values,
        bitcoin.Transaction.SIGHASH_DEFAULT,
        this.inscriptionTxCtxDataList[i].hash
      )
      const signature = Buffer.from(schnorr.sign(hash, privateKey, base.randomBytes(32)))
      revealTx.ins[0].witness = [Buffer.from(signature), ...this.inscriptionTxCtxDataList[i].witness]

      // check tx max tx wight
      const revealWeight = revealTx.weight()
      if (revealWeight > maxStandardTxWeight) {
        throw new Error(
          `reveal(index ${i}) transaction weight greater than ${maxStandardTxWeight} (MAX_STANDARD_TX_WEIGHT): ${revealWeight}`
        )
      }
    })
  }

  calculateFee() {
    let commitTxFee = 0
    this.commitTx.ins.forEach((_, i) => {
      commitTxFee += this.commitTxPrevOutputFetcher[i]
    })
    this.commitTx.outs.forEach((out) => {
      commitTxFee -= out.value
    })
    let revealTxFees: number[] = []
    this.revealTxs.forEach((revealTx, i) => {
      let revealTxFee = 0
      revealTxFee += this.revealTxPrevOutputFetcher[i]
      revealTxFee -= revealTx.outs[0].value
      revealTxFees.push(revealTxFee)
    })

    return {
      commitTxFee,
      revealTxFees,
    }
  }
}

function signTx(
  tx: bitcoin.Transaction,
  commitTxPrevOutputList: PrevOutput[],
  network: bitcoin.Network,
  privateKey: Buffer
) {
  tx.ins.forEach((input, i) => {
    const addressType = getAddressType(commitTxPrevOutputList[i].address, network)
    const privateKeyHex = base.toHex(privateKey)
    const publicKey = private2public(privateKeyHex)

    if (addressType === 'segwit_taproot') {
      const prevOutScripts = commitTxPrevOutputList.map((o) => bitcoin.address.toOutputScript(o.address, network))
      const values = commitTxPrevOutputList.map((o) => o.amount)
      const hash = tx.hashForWitnessV1(i, prevOutScripts, values, bitcoin.Transaction.SIGHASH_DEFAULT)
      // const tweakedPrivKey = taproot.taprootTweakPrivKey(privateKey)
      const signature = Buffer.from(schnorr.sign(hash, privateKey, base.randomBytes(32)))

      input.witness = [Buffer.from(signature)]
    } else if (addressType === 'legacy') {
      const prevScript = bitcoin.address.toOutputScript(commitTxPrevOutputList[i].address, network)
      const hash = tx.hashForSignature(i, prevScript, bitcoin.Transaction.SIGHASH_ALL)!
      const signature = sign(hash, privateKeyHex)
      const payment = bitcoin.payments.p2pkh({
        signature: bitcoin.script.signature.encode(signature, bitcoin.Transaction.SIGHASH_ALL),
        pubkey: publicKey,
      })

      input.script = payment.input!
    } else {
      const pubKeyHash = bcrypto.hash160(publicKey)
      const prevOutScript = Buffer.of(0x19, 0x76, 0xa9, 0x14, ...pubKeyHash, 0x88, 0xac)
      const value = commitTxPrevOutputList[i].amount
      const hash = tx.hashForWitness(i, prevOutScript, value, bitcoin.Transaction.SIGHASH_ALL)
      const signature = sign(hash, privateKeyHex)

      input.witness = [bitcoin.script.signature.encode(signature, bitcoin.Transaction.SIGHASH_ALL), publicKey]

      const redeemScript = Buffer.of(0x16, 0, 20, ...pubKeyHash)
      if (addressType === 'segwit_nested') {
        input.script = redeemScript
      }
    }
  })
}

function createMetaIdTxCtxData(
  network: bitcoin.Network,
  metaidData: MetaidData,
  publicKey: Buffer
): InscriptionTxCtxData {
  const internalPubKey = publicKey.subarray(1)
  const ops = bitcoin.script.OPS

  const inscriptionBuilder: bitcoin.payments.StackElement[] = []
  inscriptionBuilder.push(internalPubKey)
  inscriptionBuilder.push(ops.OP_CHECKSIG)
  inscriptionBuilder.push(ops.OP_FALSE)
  inscriptionBuilder.push(ops.OP_IF)
  inscriptionBuilder.push(Buffer.from('testid'))
  inscriptionBuilder.push(Buffer.from(metaidData.operation))

  if (metaidData.operation !== 'init') {
    inscriptionBuilder.push(Buffer.from(metaidData.path!))
    inscriptionBuilder.push(Buffer.from(metaidData?.encryption ?? '0'))
    inscriptionBuilder.push(Buffer.from(metaidData?.version ?? '1.0.0'))
    inscriptionBuilder.push(Buffer.from(metaidData?.contentType ?? 'utf-8'))

    const body = Buffer.from(metaidData.body!)
    const maxChunkSize = 520
    const bodySize = (body as Buffer).length
    for (let i = 0; i < bodySize; i += maxChunkSize) {
      let end = i + maxChunkSize
      if (end > bodySize) {
        end = bodySize
      }
      inscriptionBuilder.push((body as Buffer).slice(i, end))
    }
  }
  inscriptionBuilder.push(ops.OP_ENDIF)
  const inscriptionScript = bitcoin.script.compile(inscriptionBuilder)
  const scriptTree = {
    output: inscriptionScript,
  }
  const redeem = {
    output: inscriptionScript,
    redeemVersion: 0xc0,
  }

  const { output, witness, hash, address } = bitcoin.payments.p2tr({
    internalPubkey: internalPubKey,
    scriptTree,
    redeem,
    network,
  })

  return {
    inscriptionScript,
    commitTxAddress: address!,
    commitTxAddressPkScript: output!,
    witness: witness!,
    hash: hash!,
    revealTxPrevOutput: {
      pkScript: Buffer.alloc(0),
      value: 0,
    },
    revealPkScript: bitcoin.address.toOutputScript(metaidData.revealAddr, network),
  }
}

export function inscribe(network: bitcoin.Network, request: InscriptionRequest, keyPairs: BIP32Interface) {
  const tool = InscriptionTool.newInscriptionTool(network, request, keyPairs)
  if (tool.mustCommitTxFee > 0) {
    return {
      commitTx: '',
      revealTxs: [],
      commitTxFee: tool.mustCommitTxFee,
      revealTxFees: tool.mustRevealTxFees,
      commitAddrs: tool.commitAddrs,
    }
  }

  return {
    commitTx: tool.commitTx.toHex(),
    revealTxs: tool.revealTxs.map((revealTx) => revealTx.toHex()),
    ...tool.calculateFee(),
    commitAddrs: tool.commitAddrs,
  }
}

function initOptions() {
  return { noBroadcast: false }
}

interface InscribeHexResult {
  commitTxHex: string
  revealTxsHex: string[]
}

interface InscribeTxIdResult {
  commitTxId: string
  revealTxIds: string[]
}

export async function process({
  data,
  options = initOptions(),
}: {
  data: Omit<InscriptionRequest, 'commitTxPrevOutputList'>
  options: { noBroadcast: boolean }
}): Promise<InscribeHexResult | InscribeTxIdResult> {
  const network = await getBtcNetwork()
  const address = await getAddress('btc')
  const utxos = await getBtcUtxos(address)
  const commitTxPrevOutputList = utxos.map((utxo) => ({
    txId: utxo.txId,
    vOut: utxo.outputIndex,
    amount: utxo.satoshis,
    address,
  }))
  const signer = (await getSigner('btc')) as BIP32Interface

  const { commitTx, revealTxs } = inscribe(network, { ...data, commitTxPrevOutputList }, signer)
  if (!options.noBroadcast) {
    const commitTxId = await broadcastBTCTx(commitTx)
    await sleep(1000)
    const [...revealTxIds] = await Promise.all([...revealTxs.map((revealTx) => broadcastBTCTx(revealTx))])
    return { commitTxId, revealTxIds }
  }
  return { commitTxHex: commitTx, revealTxsHex: revealTxs }
}
