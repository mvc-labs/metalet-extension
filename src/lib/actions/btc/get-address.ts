import { getAddress } from '@/lib/account'

export async function process(): Promise<string> {
  return await getAddress('btc')
}
