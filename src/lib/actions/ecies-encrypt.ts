import { mvc } from 'meta-contract'
// import { getCurrentAccount, getPrivateKey } from '../account'
import { eciesEncrypt } from '../crypto'
import { createEmit } from '../emitters'

export async function process(params: any, host: string) {
  const { message } = params

  // const wif = await getPrivateKey()
  const wif = await createEmit<string>('getPrivateKey')()
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif)

  const encrypted = eciesEncrypt(message, privateKeyObj)

  return {
    status: 'ok',
    result: encrypted,
  }
}
