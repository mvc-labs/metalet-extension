import { mvc } from 'meta-contract'
import { getCurrentAccount, privateKey } from '../account'
import { eciesEncrypt } from '../crypto'

export async function process(params: any, host: string) {
  const { message } = params

  const wif = await getCurrentAccount().then(() => privateKey.value)
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif)

  const encrypted = eciesEncrypt(message, privateKeyObj)

  return {
    status: 'ok',
    result: encrypted,
  }
}
