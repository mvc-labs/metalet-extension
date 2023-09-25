import { getPublicKey } from '@/lib/account'

export async function process(): Promise<string> {
  return await getPublicKey('btc')
}
