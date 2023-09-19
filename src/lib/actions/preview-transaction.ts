import { mvc } from 'meta-contract'
import { getCurrentAccount, privateKey } from '../account'
import { signTransaction } from '../crypto'

export async function process(params: any, host: string) {
  const wif = await getCurrentAccount().then(() => privateKey.value)
  const { txid } = signTransaction(wif, params.transaction, true)

  return { txid }
}
