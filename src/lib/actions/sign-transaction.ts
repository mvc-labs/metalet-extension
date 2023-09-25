import { getAddress, getCurrentAccount, privateKey } from '../account'
import connector from '../connector'
import { signTransaction } from '../crypto'
import { getNetwork } from '../network'

export async function process(params: any, host: string) {
  const account = await getCurrentAccount()
  const network = await getNetwork()

  const signature = signTransaction(account!, network, params.transaction)

  return { signature }
}
