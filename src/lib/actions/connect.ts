import connector from '../connector'
import { getAddress, getCurrentAccount } from '../account'

export async function process(params: any, host: string) {
  const account = await getCurrentAccount()

  if (!account) {
    return { address: '', txid: '' }
  }

  await connector.connect(account.id, host)

  const address = await getAddress()

  return { address }
}
