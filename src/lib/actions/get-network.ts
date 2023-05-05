import { getNetwork } from '../network'

export async function process(params: any, host: string) {
  const network = await getNetwork()

  return { network }
}
