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

export const signMessage = (wif: string, message: string) => {
  let privateKey = mvc.PrivateKey.fromWIF(wif)
  const messageBuf = Buffer.from(message, 'utf-8')

  let sig = mvc.crypto.ECDSA.sign(messageBuf, privateKey, 'little')

  return 'hello'
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
  }
) => {
  if (!sigtype) sigtype = mvc.crypto.Signature.SIGHASH_ALL | mvc.crypto.Signature.SIGHASH_FORKID

  let sighash = mvc.Transaction.Sighash.sighash(
    new mvc.Transaction(txHex),
    sigtype,
    inputIndex,
    new mvc.Script(scriptHex),
    new BN(satoshis)
  ).toString('hex')

  let privateKey = mvc.PrivateKey.fromWIF(wif)
  let publicKey = privateKey.toPublicKey().toString()

  let sig = mvc.crypto.ECDSA.sign(Buffer.from(sighash, 'hex'), privateKey, 'little')

  return {
    publicKey,
    r: sig.r.toString('hex'),
    s: sig.s.toString('hex'),
    sig: sig.set({ nhashtype: sigtype }).toTxFormat().toString('hex'),
    sigtype,
  }
}
