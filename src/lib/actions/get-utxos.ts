import { getUtxos } from '../account'

export async function process(params: any, host: string) {
  return await getUtxos('mvc', params)
}
