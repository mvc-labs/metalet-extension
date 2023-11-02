import { getCurrentAccount } from '../account'
import { payTransactions } from '../crypto'
import { getNetwork } from '../network'

export async function process(params: any, host: string) {
  const account = await getCurrentAccount()
  const network = await getNetwork()

  const toPayTransactions = params.transactions
  const payedTransactions = await payTransactions(account!, network, toPayTransactions, params.hasMetaid)

  return { payedTransactions }
}
