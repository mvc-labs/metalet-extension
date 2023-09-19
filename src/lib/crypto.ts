import { BN, mvc } from 'meta-contract'
import { Buffer } from 'buffer'

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

export const signTransaction = (
  wif: string,
  {
    txHex,
    scriptHex,
    address,
    inputIndex,
    satoshis,
    sigtype,
  }: {
    txHex: string
    scriptHex: string
    address?: string
    inputIndex: number
    satoshis: number
    sigtype?: number
  },
  returnsTransaction: boolean = false
) => {
  if (!sigtype) sigtype = mvc.crypto.Signature.SIGHASH_ALL | mvc.crypto.Signature.SIGHASH_FORKID

  const privateKey = mvc.PrivateKey.fromWIF(wif)
  const publicKey = privateKey.toPublicKey()
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
