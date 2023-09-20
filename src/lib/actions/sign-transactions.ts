import { getAddress, getCurrentAccount, privateKey } from '../account'
import connector from '../connector'
import { signTransaction, signTransactions } from '../crypto'

export async function process(params: any, host: string) {
  const wif = await getCurrentAccount().then((account) => privateKey.value)

  const signingTransactions = params.transactions
  const signedTransactions = signTransactions(wif, signingTransactions)

  return { signedTransactions }
}
