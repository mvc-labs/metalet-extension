import { getAddress, getCurrentAccount, privateKey } from '../account'
import connector from '../connector'
import { signTransaction, signTransactions } from '../crypto'
import { getNetwork } from '../network'

export async function process(params: any, host: string) {
  const account = await getCurrentAccount()
  const network = await getNetwork()

  const signingTransactions = params.transactions
  const signedTransactions = signTransactions(account!, network, signingTransactions)

  return { signedTransactions }
}
