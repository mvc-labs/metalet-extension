import { mvc } from 'meta-contract'

import { getPrivateKey } from '../account'
import { verifySignature } from '../crypto'

export async function process(params: any, host: string) {
  const { message, signature, encoding } = params

  const wif = await getPrivateKey()
  const publicKey = mvc.PrivateKey.fromWIF(wif).toPublicKey()

  const verified = verifySignature(message, signature, publicKey, encoding)

  return {
    status: 'ok',
    result: { verified },
  }
}
