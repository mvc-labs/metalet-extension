import { getCurrentAccount, privateKey } from '../account'
import { signMessage } from '../crypto'

export async function process(params: any, host: string) {
  const wif = await getCurrentAccount().then((account) => privateKey.value)
  const signature = signMessage(wif, params.message, params.encoding)

  return { signature }
}
