import { getPublicKey, getAddress } from '@/lib/account'

interface AccountInfo {
  address: string;
  pubKey: string;
}

export async function process(): Promise<AccountInfo> {
  const address = await getAddress('btc')
  const pubKey = await getPublicKey('btc')
  return { address, pubKey }
}
