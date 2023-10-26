import ECPairFactory from 'ecpair'
import { crypto } from 'bitcoinjs-lib'
// import { getPrivateKey } from '@/lib/account'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { raise } from '@/lib/helpers'
import { createEmit } from '@/lib/emitters'

const ECPair = ECPairFactory(ecc)

export async function process(message: string): Promise<string> {
  !message && raise('Please provide the message you want to sign.')

  if (typeof message !== 'string') {
    throw new TypeError('The message to be signed must be a string.')
  }

  // const privateKey = await getPrivateKey('btc')
  const privateKey = await createEmit<string>('getPrivateKey')('btc')
  const keyPair = ECPair.fromWIF(privateKey)
  const hash = crypto.sha256(Buffer.from(message))
  const signature = keyPair.sign(hash)
  return signature.toString('hex')
}
