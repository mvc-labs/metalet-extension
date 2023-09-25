import { getCurrentAccount } from '../account'
import { signTransaction } from '../crypto'
import { getNetwork } from '../network'

export async function process(params: any, host: string) {
  const account = await getCurrentAccount()
  const network = await getNetwork()

  const { txid } = await signTransaction(account!, network, params.transaction, true)

  return { txid }
}
