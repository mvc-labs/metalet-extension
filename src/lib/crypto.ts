import { BN, mvc } from 'meta-contract'

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

export const signMessage = (wif: string, message: string, encoding?: 'utf-8' | 'base64' | 'hex' | 'utf8') => {
  let privateKey = mvc.PrivateKey.fromWIF(wif)
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

export const sign = (
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
