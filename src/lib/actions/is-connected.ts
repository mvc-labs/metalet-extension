import { getCurrentAccount, getAddress } from '../account'
import connector from '../connector'

export async function process(params: any, host: string) {
  const account = await getCurrentAccount()
  if (!account) return false

  return connector.isConnected(account.id, host)
}
