import { getAddress, getCurrentAccount, privateKey } from '../account'
import connector from '../connector'
import { signTransaction } from '../crypto'

export async function process(params: any, host: string) {
  const wif = await getCurrentAccount().then((account) => privateKey.value)

  const signingTransactions = params.transactions

  const signatures = signingTransactions.map((transaction: any) => {
    const signature = signTransaction(wif, transaction)

    return signature
  })

  return { signatures }
}
