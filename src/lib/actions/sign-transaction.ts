import { getPrivateKey } from '../account'
import { sign } from '../crypto'

export async function process(params: any, host: string) {
  const wif = await getPrivateKey('mvc')

  // let sigList = []
  // for (let i = 0; i < params.list.length; i++) {
  //   sigList[i] = sign(wif, params.list[i])
  // }
  const signature = sign(wif, params.transaction)

  return { signature }
}
