import { getCurrentAccount } from '../account'
import { signTransaction } from '../crypto'
import { getNetwork } from '../network'

export async function process(params: any, host: string) {
  const network = await getNetwork()
  const account = await getCurrentAccount()

  const signature = await signTransaction(account!, network, params.transaction)

  return { signature }
}
