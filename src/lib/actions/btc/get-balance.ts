import { getBalance, getAddress } from '@/lib/account'

export async function process(params: any, host: string) {
  const address = await getAddress('btc')

  return await getBalance(address, 'btc')
}
