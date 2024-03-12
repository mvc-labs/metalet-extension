import { getNetwork } from '@/lib/network'
import { getPrivateKey, getPublicKey } from '@/lib/account'
import { Message, PrivateKey, Networks } from 'bitcore-lib'

interface verifyMessageParams {
  text: string
  sig: string
  publicKey: string
}

export async function process(params: verifyMessageParams) {
  const { text, sig, publicKey } = params
  const pubKey = await getPublicKey('btc')
  if (publicKey !== pubKey) {
    return false
  }
  const privateKey = await getPrivateKey('btc')
  const signMessage = new Message(text)
  const network = (await getNetwork()) === 'mainnet' ? Networks.livenet : Networks.testnet
  const address = new PrivateKey(privateKey, network).toAddress()
  return signMessage.verify(address, sig)
}
