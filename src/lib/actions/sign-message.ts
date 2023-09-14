import { getCurrentAccount, privateKey } from '../account'
import { signMessage } from '../crypto'
import { mvc } from 'meta-contract'

export async function process(params: any, host: string) {
  const wif = await getCurrentAccount().then((account) => privateKey.value)
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif)
  const signature = signMessage(params.message, privateKeyObj, params.encoding)

  return { signature }
}
