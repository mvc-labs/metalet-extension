// import { getCurrentAccount } from '../account'
import { Account } from '../account'
import connector from '../connector'
import { createEmit } from '@/lib/emitters'

export async function process(params: any, host: string) {
  // const account = await getCurrentAccount()
  const account = await createEmit<Account>('getCurrentAccount')()
  if (!account) {
    return { address: '', txid: '' }
  }

  await connector.disconnect(account.id, host)

  return {
    status: 'ok',
  }
}
