import { Account } from '../account'
import connector from '../connector'
import { createEmit } from '@/lib/emitters'
// import { getAddress, getCurrentAccount } from '../account'

export async function process(params: any, host: string) {
  // const account = await getCurrentAccount()
  const account = await createEmit<Account>('getCurrentAccount')()

  if (!account) {
    return { address: '', txid: '' }
  }

  await connector.connect(account.id, host)

  // const address = await getAddress()
  const address = await createEmit<string>('getAddress')()

  return { address }
}
