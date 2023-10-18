import { BN, TxComposer, mvc } from 'meta-contract'
import { Buffer } from 'buffer'

import { getMvcRootPath, type Account } from './account'
import { parseLocalTransaction } from './metadata'
import { DERIVE_MAX_DEPTH, FEEB, P2PKH_UNLOCK_SIZE } from '@/data/config'
import { fetchUtxos } from '@/queries/utxos'

export function eciesEncrypt(message: string, privateKey: mvc.PrivateKey): string {
  const publicKey = privateKey.toPublicKey()
  const ecies = new mvc.ECIES().privateKey(privateKey).publicKey(publicKey)

  const encryptedInBuf = ecies.encrypt(message)
  const encrypted = encryptedInBuf.toString('hex')

  return encrypted
}

export function eciesDecrypt(encrypted: string, privateKey: mvc.PrivateKey): string {
  const publicKey = privateKey.toPublicKey()
  const ecies = new mvc.ECIES().privateKey(privateKey).publicKey(publicKey)

  const encryptedInBuf = Buffer.from(encrypted, 'hex')
  const message = ecies.decrypt(encryptedInBuf).toString()

  return message
}

export const signMessage = (
  message: string,
  privateKey: mvc.PrivateKey,
  encoding?: 'utf-8' | 'base64' | 'hex' | 'utf8'
) => {
  const messageHash = mvc.crypto.Hash.sha256(Buffer.from(message))

  let sigBuf = mvc.crypto.ECDSA.sign(messageHash, privateKey).toBuffer()

  let signature: string
  switch (encoding) {
    case 'utf-8':
    case 'utf8':
      signature = sigBuf.toString('utf-8')
      break
    case 'base64':
      signature = sigBuf.toString('base64')
      break
    case 'hex':
    default:
      signature = sigBuf.toString('hex')
      break
  }

  return {
    signature,
  }
}

export const verifySignature = (
  message: string,
  signature: string,
  publicKey: mvc.PublicKey,
  encoding?: 'utf-8' | 'base64' | 'hex' | 'utf8'
) => {
  const messageHash = mvc.crypto.Hash.sha256(Buffer.from(message))

  const sigDER = Buffer.from(signature, encoding || 'hex')
  const sigObj = mvc.crypto.Signature.fromDER(sigDER)

  let verified = mvc.crypto.ECDSA.verify(messageHash, sigObj, publicKey)

  return { verified }
}

type ToSignTransaction = {
  txHex: string
  scriptHex: string
  inputIndex: number
  inputIndexes?: number[]
  satoshis: number
  sigtype?: number
  path?: string
  hasMetaId?: boolean
  dataDependsOn?: number
}
export const signTransaction = async (
  account: Account,
  network: 'testnet' | 'mainnet',
  { txHex, scriptHex, inputIndex, satoshis, sigtype, path }: ToSignTransaction,
  returnsTransaction: boolean = false
) => {
  const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
  const hdpk = mneObj.toHDPrivateKey('', network)
  const rootPath = await getMvcRootPath()
  // find out priv / pub according to path
  const subPath = path || '0/0'
  const privateKey = hdpk.deriveChild(`${rootPath}/${subPath}`).privateKey
  const publicKey = privateKey.toPublicKey()

  if (!sigtype) sigtype = mvc.crypto.Signature.SIGHASH_ALL | mvc.crypto.Signature.SIGHASH_FORKID

  const tx = new mvc.Transaction(txHex)

  let sighash = mvc.Transaction.Sighash.sighash(
    tx,
    sigtype,
    inputIndex,
    new mvc.Script(scriptHex),
    new BN(satoshis)
  ).toString('hex')

  let sig = mvc.crypto.ECDSA.sign(Buffer.from(sighash, 'hex'), privateKey, 'little')

  if (returnsTransaction) {
    const signedScript = mvc.Script.buildPublicKeyHashIn(publicKey, sig, sigtype)
    tx.inputs[inputIndex].setScript(signedScript)

    return {
      txHex: tx.toString(),
      txid: tx.id,
    }
  }

  return {
    publicKey: publicKey.toString(),
    r: sig.r.toString('hex'),
    s: sig.s.toString('hex'),
    sig: sig.set({ nhashtype: sigtype }).toTxFormat().toString('hex'),
    sigtype,
    txid: tx.id,
  }
}

export const signTransactions = async (
  account: Account,
  network: 'testnet' | 'mainnet',
  toSignTransactions: ToSignTransaction[]
) => {
  const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
  const hdpk = mneObj.toHDPrivateKey('', network)
  const rootPath = await getMvcRootPath()

  // find out if transactions other than the first one are dependent on previous ones
  // if so, we need to sign them in order, and sequentially update the prevTxId of the later ones
  // so that the signature of the previous one can be calculated correctly
  const toSignTransactionsWithDependsOn: (ToSignTransaction & {
    dependsOn?: number
  })[] = []
  const txids = toSignTransactions.map((tx) => new mvc.Transaction(tx.txHex).id)
  for (let i = 0; i < toSignTransactions.length; i++) {
    const { txHex, inputIndex } = toSignTransactions[i]
    const tx = new mvc.Transaction(txHex)
    const prevTxId = tx.inputs[inputIndex].prevTxId.toString('hex')
    if (txids.includes(prevTxId)) {
      toSignTransactionsWithDependsOn.push({
        ...toSignTransactions[i],
        dependsOn: txids.indexOf(prevTxId),
      })
    } else {
      toSignTransactionsWithDependsOn.push(toSignTransactions[i])
    }
  }

  const signedTransactions: {
    txHex: string
    txid: string
  }[] = []
  for (let i = 0; i < toSignTransactionsWithDependsOn.length; i++) {
    let { txHex, scriptHex, inputIndex, satoshis, sigtype, hasMetaId } = toSignTransactionsWithDependsOn[i]
    const toSign = toSignTransactionsWithDependsOn[i]

    if (!sigtype) {
      sigtype = mvc.crypto.Signature.SIGHASH_ALL | mvc.crypto.Signature.SIGHASH_FORKID
    }

    const tx = new mvc.Transaction(txHex)

    // find out if this transaction depends on previous ones
    // if so, we need to update the prevTxId of the current one
    if (toSign.dependsOn !== undefined) {
      // structure dependencies
      const wrongTxId = tx.inputs[inputIndex].prevTxId.toString('hex')
      const prevTxId = signedTransactions[toSign.dependsOn].txid

      // data dependencies
      let wrongDataTxId: string
      let prevDataTxId: string
      if (toSign.dataDependsOn !== undefined) {
        const dataDependentTx = new mvc.Transaction(toSignTransactionsWithDependsOn[toSign.dataDependsOn].txHex)
        wrongDataTxId = dataDependentTx.id
        prevDataTxId = signedTransactions[toSign.dataDependsOn].txid
      } else {
        wrongDataTxId = wrongTxId
        prevDataTxId = prevTxId
      }

      // update the prevTxId of the current tx
      tx.inputs[inputIndex].prevTxId = Buffer.from(prevTxId, 'hex')

      // if hasMetaId is true, we need to also update the parent txid written in OP_RETURN
      // based on the wrongDataTxId and prevDataTxId
      if (hasMetaId) {
        const { messages: metaIdMessages, outputIndex } = await parseLocalTransaction(tx)

        if (outputIndex !== null) {
          // find out if prevTxId is already in the messages;
          // if so, we need to replace it with the new one
          for (let i = 0; i < metaIdMessages.length; i++) {
            if (metaIdMessages[i].includes(wrongDataTxId)) {
              metaIdMessages[i] = metaIdMessages[i].replace(wrongDataTxId, prevDataTxId)
              break
            }
          }

          // update the OP_RETURN
          const opReturnOutput = new mvc.Transaction.Output({
            script: mvc.Script.buildSafeDataOut(metaIdMessages),
            satoshis: 0,
          })

          // update the OP_RETURN output in tx
          tx.outputs[outputIndex] = opReturnOutput
        }
      }
    }

    // find out priv / pub according to path
    const subPath = toSign.path || '0/0'
    const privateKey = hdpk.deriveChild(`${rootPath}/${subPath}`).privateKey
    const publicKey = privateKey.toPublicKey()

    // Build signature of this input
    const signature = mvc.Transaction.Sighash.sign(
      tx,
      privateKey,
      sigtype,
      inputIndex,
      new mvc.Script(scriptHex),
      new BN(satoshis)
    )
    const signatureScript = mvc.Script.buildPublicKeyHashIn(publicKey, signature, sigtype)
    tx.inputs[inputIndex].setScript(signatureScript)

    signedTransactions.push({
      txHex: tx.toString(),
      txid: tx.id,
    })
  }

  return signedTransactions
}

/**
 * the core difference between signTransaction and payTransaction is that
 * pay not only signs the transaction, but also tries to finish the transaction by adding payment UTXO and change accordingly
 * That way, by using this api, application developers can avoid the hassle of looking for a appropriate paying utxo, calculating the change and adding the change output
 * isn't that a cool idea?
 *
 */
type ToPayTransaction = {
  txHex: string
  // scriptHex: string
  // inputIndex: number
  // inputIndexes?: number[]
  // satoshis: number
  // sigtype?: number
  // path?: string
  // hasMetaId?: boolean
  // dataDependsOn?: number
}
export const payTransactions = async (
  account: Account,
  network: 'testnet' | 'mainnet',
  toPayTransactions: ToPayTransaction[]
) => {
  // currently we only support one transaction
  if (toPayTransactions.length !== 1) {
    throw new Error('Currently we only support one transaction')
  }

  // first we finish the transaction by finding the appropriate utxo and calculating the change
  const toSignTransaction = toPayTransactions[0]
  const { txHex } = toSignTransaction
  const tx = new mvc.Transaction(txHex)
  const txComposer = new TxComposer(tx)
  // make sure that every input has an output
  const inputs = tx.inputs
  for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].output) {
      throw new Error('The output of every input of the transaction must be provided')
    }
  }

  const address = account.mvc.mainnetAddress
  const addressObj = new mvc.Address(address, network)
  // find out the total amount of the transaction (total output minus total input)
  const totalOutput = tx.outputs.reduce((acc, output) => acc + output.satoshis, 0)
  const totalInput = tx.inputs.reduce((acc, input) => acc + input.output!.satoshis, 0)
  const difference = totalOutput - totalInput
  const utxos = await fetchUtxos(address)
  const pickedUtxos = pickUtxo(utxos, difference)

  pickedUtxos.forEach((v) => {
    txComposer.appendP2PKHInput({
      address: addressObj,
      txId: v.txId,
      outputIndex: v.outputIndex,
      satoshis: v.satoshis,
    })
  })
  txComposer.appendP2PKHOutput({
    address: addressObj,
    satoshis: difference,
  })
  txComposer.appendChangeOutput(addressObj, FEEB)

  // sign

  const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
  const hdpk = mneObj.toHDPrivateKey('', network)

  const rootPath = await getMvcRootPath()
  const basePrivateKey = hdpk.deriveChild(rootPath)
  const rootPrivateKey = hdpk.deriveChild(`${rootPath}/0/0`).privateKey

  // now that we have root private key to sign other inputs
  // we have to find out the private key of the 0-indexed input
  const firstInputAddress = new mvc.Address(tx.inputs[0].output!.script, network)
  let deriver = 0
  let toUsePrivateKey: mvc.PrivateKey | undefined = undefined
  while (deriver < DERIVE_MAX_DEPTH) {
    const childPk = basePrivateKey.deriveChild(0).deriveChild(deriver)
    const childAddress = childPk.publicKey.toAddress('mainnet' as any).toString()

    if (childAddress === firstInputAddress.toString()) {
      toUsePrivateKey = childPk.privateKey
      break
    }

    deriver++
  }
  if (!toUsePrivateKey) {
    throw new Error('Cannot find the private key of the first input')
  }

  // sign the first input with found private key
  txComposer.unlockP2PKHInput(toUsePrivateKey, 0)

  // txComposer.unlockP2PKHInput(firstInputPrivateKey, 0)

  pickedUtxos.forEach((v, index) => {
    txComposer.unlockP2PKHInput(rootPrivateKey, index)
  })
}

type SA_utxo = {
  txId: string
  outputIndex: number
  satoshis: number
  address: string
  height: number
}
function pickUtxo(utxos: SA_utxo[], amount: number) {
  // amount + 2 outputs + buffer
  let requiredAmount = amount + 34 * 2 * FEEB + 100
  const candidateUtxos: SA_utxo[] = []
  // split utxo to confirmed and unconfirmed and shuffle them
  const confirmedUtxos = utxos
    .filter((utxo) => {
      return utxo.height > 0
    })
    .sort(() => Math.random() - 0.5)
  const unconfirmedUtxos = utxos
    .filter((utxo) => {
      return utxo.height < 0
    })
    .sort(() => Math.random() - 0.5)

  let current = 0
  // use confirmed first
  for (let utxo of confirmedUtxos) {
    current += utxo.satoshis
    // add input fee
    requiredAmount += FEEB * P2PKH_UNLOCK_SIZE
    candidateUtxos.push(utxo)
    if (current > requiredAmount) {
      return candidateUtxos
    }
  }
  for (let utxo of unconfirmedUtxos) {
    current += utxo.satoshis
    // add input fee
    requiredAmount += FEEB * P2PKH_UNLOCK_SIZE
    candidateUtxos.push(utxo)
    if (current > requiredAmount) {
      return candidateUtxos
    }
  }
  return candidateUtxos
}
