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
  // if (address) {
  //   if (walletManager.checkBsvAddress(address)) {
  //     if (address !== walletManager.getMainAddress()) {
  //       throw new Error('unsupported address in inputInfos')
  //     } else privateKey = bsv156.PrivateKey.fromWIF(wif)
  //   } //传了address却不是地址，则视为path去衍生
  //   else privateKey = bsv156.PrivateKey.fromWIF(walletManager.getWif(address)) //address :比如 /0/0
  // } else privateKey = bsv156.PrivateKey.fromWIF(wif)

  let publicKey = privateKey.toPublicKey().toString()

  let sig = mvc.crypto.ECDSA.sign(Buffer.from(sighash, 'hex'), privateKey, 'little')

  return {
    publicKey,
    r: sig.r.toString('hex'),
    s: sig.s.toString('hex'),
    sig: sig.set({ nhashtype: sigtype }).toTxFormat().toString('hex'),
  }
}
