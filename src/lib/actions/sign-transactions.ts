import { getCurrentAccount } from '../account'
import { signTransactions } from '../crypto'
import { getNetwork } from '../network'

export async function process(params: any, host: string) {
  const network = await getNetwork()
  const account = await getCurrentAccount()

  const signingTransactions = params.transactions
  const signedTransactions = await signTransactions(account!, network, signingTransactions)

  return { signedTransactions }
}
