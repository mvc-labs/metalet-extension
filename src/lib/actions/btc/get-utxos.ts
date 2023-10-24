import { getUtxos } from '@/lib/account'

export async function process() {
  return await getUtxos('btc')
}
