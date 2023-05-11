import { getAddress, getCurrentAccount, privateKey } from '../account'
import connector from '../connector'
import { sign } from '../crypto'
import { sleep } from '../helpers'

export async function process(params: any, host: string) {
  const wif = await getCurrentAccount().then((account) => privateKey.value)

  // let sigList = []
  // for (let i = 0; i < params.list.length; i++) {
  //   sigList[i] = sign(wif, params.list[i])
  // }
  const signature = sign(wif, params.transaction)

  return { signature }
}
