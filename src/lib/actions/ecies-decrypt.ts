import { mvc } from 'meta-contract'
// import { getPrivateKey } from '../account'
import { eciesDecrypt } from '../crypto'
import { createEmit } from '../emitters'

export async function process(params: any, host: string) {
  const { encrypted } = params

  // const wif = await getPrivateKey()
  const wif = await createEmit<string>('getPrivateKey')()
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif)

  const message = eciesDecrypt(encrypted, privateKeyObj)

  return {
    status: 'ok',
    result: message,
  }
}
