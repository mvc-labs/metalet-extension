import { getCurrentAccount } from '../account'
import { payTransactions } from '../crypto'
import { getNetwork } from '../network'

export async function process(params: any, host: string) {
  const account = await getCurrentAccount()
  const network = await getNetwork()

  const signingTransactions = params.transactions
  const signedTransactions = await payTransactions(account!, network, signingTransactions)

  return { signedTransactions }
}
