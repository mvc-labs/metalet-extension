import connector from '../../connector'
import { getPublicKey, getAddress, getCurrentAccount } from '@/lib/account'

interface AccountInfo {
  address: string;
  pubKey: string;
}

export async function process(params: any, host: string): Promise<AccountInfo> {
  const account = await getCurrentAccount()
  if (!account) {
    return { address: '', pubKey: '' }
  }
  await connector.connect(account.id, host)
  const address = await getAddress('btc')
  const pubKey = await getPublicKey('btc')
  return { address, pubKey }
}
