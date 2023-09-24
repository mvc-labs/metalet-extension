import ECPairFactory from 'ecpair'
import { crypto } from 'bitcoinjs-lib'
import { getNetwork } from '@/lib/network'
import { currentAccount } from '@/lib/account'
import { deriveBtcPrivateKey } from '@/lib/bip32-deriver'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'

const ECPair = ECPairFactory(ecc)

export async function process(message: string): Promise<string> {
  if (!currentAccount.value) {
    throw new Error('Please select an account to proceed.')
  }
  if (!message) {
    throw new Error('Please provide the message you want to sign.')
  }
  if (typeof message !== 'string') {
    throw new TypeError('The message to be signed must be a string.')
  }
  const network = await getNetwork()
  const path = currentAccount.value.btc.path
  const mnemonic = currentAccount.value.mnemonic
  const { privateKey } = deriveBtcPrivateKey(mnemonic, path, network)
  const keyPair = ECPair.fromPrivateKey(privateKey!)
  const hash = crypto.sha256(Buffer.from(message))
  const signature = keyPair.sign(hash)
  return signature.toString('hex')
}
