import { mvc } from 'meta-contract'

// import { getPrivateKey } from '../account'
import { signMessage } from '../crypto'
import { createEmit } from '../emitters'

export async function process(params: any, host: string) {
  // const wif = await getPrivateKey()
  const wif = await createEmit<string>('getPrivateKey')()
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif)
  const signature = signMessage(params.message, privateKeyObj, params.encoding)

  return { signature }
}
