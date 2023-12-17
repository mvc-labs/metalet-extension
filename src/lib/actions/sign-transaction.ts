// import { getAddress, getCurrentAccount } from '../account'
import { Account } from '../account'
import { signTransaction } from '../crypto'
import { createEmit } from '../emitters'
import { getNetwork } from '../network'

export async function process(params: any, host: string) {
  const network = await getNetwork()
  // const account = await getCurrentAccount()
  const account = await createEmit<Account>('getCurrentAccount')()

  const signature = await signTransaction(account!, network, params.transaction)

  return { signature }
}
