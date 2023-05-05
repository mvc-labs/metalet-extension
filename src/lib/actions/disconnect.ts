import { getCurrentAccount } from '../account'
import connector from '../connector'

export async function process(params: any, host: string) {
  const account = await getCurrentAccount()
  if (!account) {
    return { address: '', txid: '' }
  }

  await connector.disconnect(account.id, host)

  return {
    status: 'ok',
  }
}
