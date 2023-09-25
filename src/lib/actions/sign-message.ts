import { mvc } from 'meta-contract'

import { getPrivateKey } from '../account'
import { signMessage } from '../crypto'

export async function process(params: any, host: string) {
  const wif = await getPrivateKey()
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif)
  const signature = signMessage(params.message, privateKeyObj, params.encoding)

  return { signature }
}
