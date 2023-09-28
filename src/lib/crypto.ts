import { BN, mvc } from 'meta-contract'
import { Buffer } from 'buffer'
import { getMvcRootPath, type Account } from './account'
import { parseLocalTransaction } from './metadata'

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

  const Interp = mvc.Script.Interpreter
  const flags =
    Interp.SCRIPT_ENABLE_MAGNETIC_OPCODES |
    Interp.SCRIPT_ENABLE_MONOLITH_OPCODES |
    Interp.SCRIPT_VERIFY_STRICTENC |
    Interp.SCRIPT_ENABLE_SIGHASH_FORKID |
    Interp.SCRIPT_VERIFY_LOW_S |
    Interp.SCRIPT_VERIFY_NULLFAIL |
    Interp.SCRIPT_VERIFY_DERSIG |
    Interp.SCRIPT_VERIFY_MINIMALDATA |
    Interp.SCRIPT_VERIFY_NULLDUMMY |
    Interp.SCRIPT_VERIFY_DISCOURAGE_UPGRADABLE_NOPS |
    Interp.SCRIPT_VERIFY_CHECKLOCKTIMEVERIFY |
    Interp.SCRIPT_VERIFY_CHECKSEQUENCEVERIFY |
    // @ts-ignore
    Interp.SCRIPT_VERIFY_CLEANSTACK

  const script = mvc.Script.fromBuffer(Buffer.from(scriptHex, 'hex'))
  // @ts-ignore
  const sig2 = mvc.Transaction.sighash
    .sign(tx, privateKey, sigtype, inputIndex, script, new BN(satoshis), flags)
    .toTxFormat()
    .toString('hex')

  // const sig3 = toHex(signTx(tx, privateKey, script, Number(satoshis), inputIndex))

  return {
    publicKey: publicKey.toString(),
    r: sig.r.toString('hex'),
    s: sig.s.toString('hex'),
    sig: sig.set({ nhashtype: sigtype }).toTxFormat().toString('hex'),
    sig2,
    // sig3,
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
