import { mvc } from 'meta-contract'
import { getCurrentAccount, privateKey } from '../account'
import { eciesDecrypt } from '../crypto'

export async function process(params: any, host: string) {
  const { encrypted } = params

  const wif = await getCurrentAccount().then(() => privateKey.value)
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif)

  const message = eciesDecrypt(encrypted, privateKeyObj)

  return {
    status: 'ok',
    result: message,
  }
}
