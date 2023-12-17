import { mvc } from 'meta-contract'
import { getPrivateKey } from '../account'
import { eciesEncrypt } from '../crypto'

export async function process(params: any, host: string) {
  const { message } = params

  const wif = await getPrivateKey()
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif)

  const encrypted = eciesEncrypt(message, privateKeyObj)

  return {
    status: 'ok',
    result: encrypted,
  }
}
