import { mvc } from 'meta-contract'
import { getCurrentAccount, privateKey } from '../account'
import { verifySignature } from '../crypto'

export async function process(params: any, host: string) {
  const { message, signature, encoding } = params

  const wif = await getCurrentAccount().then(() => privateKey.value)
  const publicKey = mvc.PrivateKey.fromWIF(wif).toPublicKey()

  const verified = verifySignature(message, signature, publicKey, encoding)

  return {
    status: 'ok',
    result: { verified },
  }
}
